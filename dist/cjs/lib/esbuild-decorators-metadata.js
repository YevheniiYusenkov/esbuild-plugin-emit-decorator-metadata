"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuildDecoratorsMetadata = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const typescript_1 = require("typescript");
const has_decorator_in_buffer_js_1 = require("./has-decorator-in-buffer.js");
const diagnostics_js_1 = require("./diagnostics.js");
const parse_tsconfig_js_1 = require("./parse-tsconfig.js");
const worker_pool_js_1 = require("./worker-pool.js");
const esbuildDecoratorsMetadata = (options = {}) => ({
    name: "tsc",
    setup(build) {
        const cwd = options.cwd || process.cwd();
        const tsconfigPath = options.tsconfig ||
            build.initialOptions?.tsconfig ||
            (0, node_path_1.join)(cwd, "./tsconfig.json");
        const forceTsc = options.force ?? false;
        const tsx = options.tsx ?? true;
        const parsedTsConfig = (0, parse_tsconfig_js_1.parseTsConfig)(tsconfigPath, cwd);
        if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata) {
            return;
        }
        const supportsLifecycle = typeof build.onDispose === "function" ||
            typeof build.onEnd === "function";
        const computedWorkers = options.workers === false
            ? 1
            : options.workers === "auto" || options.workers == null
                ? (0, worker_pool_js_1.getDefaultWorkerCount)()
                : Math.max(1, Number(options.workers) || 1);
        // If the environment doesn't give lifecycle hooks (like in test stubs) — work without workers,
        // to not hang open handles and not fail tests.
        const workerCount = supportsLifecycle ? computedWorkers : 1;
        let pool = workerCount > 1 ? new worker_pool_js_1.TranspileWorkerPool(workerCount) : null;
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
        if (typeof build.onDispose === "function") {
            build.onDispose(destroyPool);
        }
        if (typeof build.onEnd === "function") {
            build.onEnd(destroyPool);
        }
        // In case of no hooks, clean up at the end of the process.
        process.once("SIGINT", destroyPool);
        process.once("SIGTERM", destroyPool);
        process.once("exit", destroyPool);
        build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
            if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata)
                return;
            if (args.path.endsWith(".d.ts"))
                return;
            const buf = await node_fs_1.promises
                .readFile(args.path)
                .catch((err) => (0, diagnostics_js_1.printDiagnostics)({ file: args.path, err }));
            if (!buf) {
                (0, diagnostics_js_1.printDiagnosticsErrors)({ file: args.path, err: "File not found" });
                return;
            }
            if (!forceTsc && !(0, has_decorator_in_buffer_js_1.hasDecoratorInBuffer)(buf))
                return;
            const ts = buf.toString("utf8");
            const contents = pool
                ? await pool.transpile({
                    source: ts,
                    fileName: args.path,
                    compilerOptions: baseCompilerOptions,
                })
                : (0, typescript_1.transpileModule)(ts, {
                    fileName: args.path,
                    compilerOptions: baseCompilerOptions,
                    reportDiagnostics: false,
                }).outputText;
            const isTSX = args.path.endsWith(".tsx");
            const loader = isTSX ? "jsx" : "js";
            return { contents, resolveDir: (0, node_path_1.dirname)(args.path), loader };
        });
    },
});
exports.esbuildDecoratorsMetadata = esbuildDecoratorsMetadata;
//# sourceMappingURL=esbuild-decorators-metadata.js.map