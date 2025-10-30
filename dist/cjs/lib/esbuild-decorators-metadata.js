"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuildDecoratorsMetadata = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const typescript_1 = require("typescript");
const strip_it_js_1 = require("./strip-it.js");
const diagnostics_js_1 = require("./diagnostics.js");
const parse_tsconfig_js_1 = require("./parse-tsconfig.js");
const { readFile } = fs_1.promises;
const decoratorsFinderRegex = new RegExp(/((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/);
const findDecorators = (fileContent) => fileContent && decoratorsFinderRegex.test((0, strip_it_js_1.strip)(fileContent));
const esbuildDecoratorsMetadata = (options = {}) => ({
    name: "tsc",
    setup(build) {
        const cwd = options.cwd || process.cwd();
        const tsconfigPath = options.tsconfig ||
            build.initialOptions?.tsconfig ||
            (0, path_1.join)(cwd, "./tsconfig.json");
        const forceTsc = options.force ?? false;
        const tsx = options.tsx ?? true;
        const parsedTsConfig = (0, parse_tsconfig_js_1.parseTsConfig)(tsconfigPath, cwd);
        build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
            // return if we don't need to search the file
            if (!forceTsc && !parsedTsConfig?.options?.emitDecoratorMetadata) {
                return;
            }
            const ts = await readFile(args.path, "utf8").catch((err) => (0, diagnostics_js_1.printDiagnostics)({ file: args.path, err }));
            // return if the file is not found
            if (!ts) {
                (0, diagnostics_js_1.printDiagnosticsErrors)({ file: args.path, err: "File not found" });
                return;
            }
            // Find the decorator and if there isn't one, return out
            const hasDecorator = findDecorators(ts);
            if (!hasDecorator)
                return;
            const program = (0, typescript_1.transpileModule)(ts, {
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
                resolveDir: (0, path_1.dirname)(args.path),
                loader,
            };
        });
    },
});
exports.esbuildDecoratorsMetadata = esbuildDecoratorsMetadata;
//# sourceMappingURL=esbuild-decorators-metadata.js.map