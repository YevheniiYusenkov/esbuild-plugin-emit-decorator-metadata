import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";

import type { Plugin } from "esbuild";
import { transpileModule } from "typescript";

import { hasDecoratorInBuffer } from "./has-decorator-in-buffer.js";
import { printDiagnostics, printDiagnosticsErrors } from "./diagnostics.js";
import { parseTsConfig } from "./parse-tsconfig.js";
import { TranspileWorkerPool, getDefaultWorkerCount } from "./worker-pool.js";

export interface EsbuildDecoratorsMetadataOptions {
  tsconfig?: string;
  cwd?: string;
  force?: boolean;
  tsx?: boolean;
  workers?: number | "auto" | false;
}

export const esbuildDecoratorsMetadata = (
  options: EsbuildDecoratorsMetadataOptions = {}
): Plugin => ({
  name: "tsc",
  setup(build) {
    const cwd = options.cwd || process.cwd();
    const tsconfigPath =
      options.tsconfig ||
      build.initialOptions?.tsconfig ||
      join(cwd, "./tsconfig.json");
    const forceTsc = options.force ?? false;
    const tsx = options.tsx ?? true;

    const parsedTsConfig = parseTsConfig(tsconfigPath, cwd);

    if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata) {
      return;
    }

    const supportsLifecycle =
      typeof (build as any).onDispose === "function" ||
      typeof (build as any).onEnd === "function";

    const computedWorkers =
      options.workers === false
        ? 1
        : options.workers === "auto" || options.workers == null
        ? getDefaultWorkerCount()
        : Math.max(1, Number(options.workers) || 1);

    // If the environment doesn't give lifecycle hooks (like in test stubs) — work without workers,
    // to not hang open handles and not fail tests.
    const workerCount = supportsLifecycle ? computedWorkers : 1;

    let pool: TranspileWorkerPool | null =
      workerCount > 1 ? new TranspileWorkerPool(workerCount) : null;

    const baseCompilerOptions = {
      ...parsedTsConfig.options,
      sourceMap: false,
      inlineSources: true,
      inlineSourceMap: true,
    };

    const destroyPool = () => {
      if (pool) {
        pool.destroy();
        pool = null;
      }
    };

    if (typeof (build as any).onDispose === "function") {
      (build as any).onDispose(destroyPool);
    }
    if (typeof (build as any).onEnd === "function") {
      (build as any).onEnd(destroyPool);
    }

    // In case of no hooks, clean up at the end of the process.
    process.once("SIGINT", destroyPool);
    process.once("SIGTERM", destroyPool);
    process.once("exit", destroyPool);

    build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
      if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata) return;
      if (args.path.endsWith(".d.ts")) return;

      const buf = await fs
        .readFile(args.path)
        .catch((err) => printDiagnostics({ file: args.path, err }));
      if (!buf) {
        printDiagnosticsErrors({ file: args.path, err: "File not found" });
        return;
      }

      if (!forceTsc && !hasDecoratorInBuffer(buf)) return;

      const ts = buf.toString("utf8");
      const contents = pool
        ? await pool.transpile({
            source: ts,
            fileName: args.path,
            compilerOptions: baseCompilerOptions,
          })
        : transpileModule(ts, {
            fileName: args.path,
            compilerOptions: baseCompilerOptions,
            reportDiagnostics: false,
          }).outputText;

      const isTSX = args.path.endsWith(".tsx");
      const loader = isTSX ? "jsx" : "js";
      return { contents, resolveDir: dirname(args.path), loader };
    });
  },
});
