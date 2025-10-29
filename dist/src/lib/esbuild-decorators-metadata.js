"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuildDecoratorsMetadata = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = require("path");
const typescript_1 = require("typescript");
const strip_it_1 = require("./strip-it");
const diagnostics_1 = require("./diagnostics");
const parse_tsconfig_1 = require("./parse-tsconfig");
const { readFile } = fs_1.promises;
const decoratorsFinderRegex = new RegExp(/((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/);
const findDecorators = (fileContent) => fileContent && decoratorsFinderRegex.test((0, strip_it_1.strip)(fileContent));
const esbuildDecoratorsMetadata = (options = {}) => ({
    name: "tsc",
    setup(build) {
        var _a, _b, _c;
        const cwd = options.cwd || process.cwd();
        const tsconfigPath = options.tsconfig ||
            ((_a = build.initialOptions) === null || _a === void 0 ? void 0 : _a.tsconfig) ||
            (0, path_1.join)(cwd, "./tsconfig.json");
        const forceTsc = (_b = options.force) !== null && _b !== void 0 ? _b : false;
        const tsx = (_c = options.tsx) !== null && _c !== void 0 ? _c : true;
        const parsedTsConfig = (0, parse_tsconfig_1.parseTsConfig)(tsconfigPath, cwd);
        build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, (args) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            // return if we don't need to search the file
            if (!forceTsc && !((_a = parsedTsConfig === null || parsedTsConfig === void 0 ? void 0 : parsedTsConfig.options) === null || _a === void 0 ? void 0 : _a.emitDecoratorMetadata)) {
                return;
            }
            const ts = yield readFile(args.path, "utf8").catch((err) => (0, diagnostics_1.printDiagnostics)({ file: args.path, err }));
            // return if the file is not found
            if (!ts) {
                (0, diagnostics_1.printDiagnosticsErrors)({ file: args.path, err: "File not found" });
                return;
            }
            // Find the decorator and if there isn't one, return out
            const hasDecorator = findDecorators(ts);
            if (!hasDecorator)
                return;
            const program = (0, typescript_1.transpileModule)(ts, {
                fileName: args.path,
                compilerOptions: Object.assign(Object.assign({}, parsedTsConfig.options), { sourceMap: false, inlineSources: true, inlineSourceMap: true }),
                reportDiagnostics: false,
            });
            const isTSX = args.path.endsWith(".tsx");
            const loader = isTSX ? "jsx" : "js";
            return {
                contents: program.outputText,
                resolveDir: (0, path_1.dirname)(args.path),
                loader,
            };
        }));
    },
});
exports.esbuildDecoratorsMetadata = esbuildDecoratorsMetadata;
//# sourceMappingURL=esbuild-decorators-metadata.js.map