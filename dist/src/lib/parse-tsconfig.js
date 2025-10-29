"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTsConfig = parseTsConfig;
const path_1 = require("path");
const typescript_1 = require("typescript");
const diagnostics_1 = require("./diagnostics");
function parseTsConfig(tsconfig, cwd = process.cwd()) {
    var _a;
    const fileName = (0, typescript_1.findConfigFile)(cwd, typescript_1.sys.fileExists, tsconfig);
    // if the value was provided, but no file, fail hard
    if (tsconfig !== undefined && !fileName)
        throw new Error(`failed to open '${fileName}'`);
    let loadedConfig = {};
    let baseDir = cwd;
    if (fileName) {
        const text = typescript_1.sys.readFile(fileName);
        if (text === undefined)
            throw new Error(`failed to read '${fileName}'`);
        const result = (0, typescript_1.parseConfigFileTextToJson)(fileName, text);
        if ((result === null || result === void 0 ? void 0 : result.error) || !(result === null || result === void 0 ? void 0 : result.config)) {
            (0, diagnostics_1.printDiagnosticsErrors)(result.error);
            throw new Error(`failed to parse '${fileName}'`);
        }
        loadedConfig = result.config;
        baseDir = (0, path_1.dirname)(fileName);
    }
    const parsedTsConfig = (0, typescript_1.parseJsonConfigFileContent)(loadedConfig, typescript_1.sys, baseDir);
    if (((_a = parsedTsConfig === null || parsedTsConfig === void 0 ? void 0 : parsedTsConfig.errors) === null || _a === void 0 ? void 0 : _a.length) > 0)
        (0, diagnostics_1.printDiagnosticsErrors)(parsedTsConfig.errors);
    return parsedTsConfig;
}
//# sourceMappingURL=parse-tsconfig.js.map