import { promises } from "fs";
import { join, dirname } from "path";

import type { Plugin } from "esbuild";
import { transpileModule } from "typescript";

import { strip } from "./strip-it.js";
import { printDiagnostics, printDiagnosticsErrors } from "./diagnostics.js";
import { parseTsConfig } from "./parse-tsconfig.js";

export interface EsbuildDecoratorsMetadataOptions {
  tsconfig?: string;
  cwd?: string;
  force?: boolean;
  tsx?: boolean;
}

const { readFile } = promises;

const decoratorsFinderRegex = new RegExp(
  /((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/
);

const findDecorators = (fileContent: string | void) =>
  fileContent && decoratorsFinderRegex.test(strip(fileContent));

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

    build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
      // return if we don't need to search the file
      if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata) {
        return;
      }

      const ts = await readFile(args.path, "utf8").catch((err) =>
        printDiagnostics({ file: args.path, err })
      );

      // return if the file is not found
      if (!ts) {
        printDiagnosticsErrors({ file: args.path, err: "File not found" });
        return;
      }

      // Find the decorator and if there isn't one, return out
      const hasDecorator = findDecorators(ts);
      if (!hasDecorator) return;

      const program = transpileModule(ts, {
        fileName: args.path,
        compilerOptions: {
          ...parsedTsConfig.options,
          sourceMap: false,
          inlineSources: true,
          inlineSourceMap: true,
        },
        reportDiagnostics: false,
      });

      const isTSX = args.path.endsWith(".tsx");
      const loader = isTSX ? "jsx" : "js";

      return {
        contents: program.outputText,
        resolveDir: dirname(args.path),
        loader,
      };
    });
  },
});
