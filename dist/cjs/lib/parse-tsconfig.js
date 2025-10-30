"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTsConfig = parseTsConfig;
const path_1 = require("path");
const typescript_1 = require("typescript");
const diagnostics_js_1 = require("./diagnostics.js");
function parseTsConfig(tsconfig, cwd = process.cwd()) {
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
        if (result?.error || !result?.config) {
            (0, diagnostics_js_1.printDiagnosticsErrors)(result.error);
            throw new Error(`failed to parse '${fileName}'`);
        }
        loadedConfig = result.config;
        baseDir = (0, path_1.dirname)(fileName);
    }
    const parsedTsConfig = (0, typescript_1.parseJsonConfigFileContent)(loadedConfig, typescript_1.sys, baseDir);
    if (parsedTsConfig?.errors?.length > 0)
        (0, diagnostics_js_1.printDiagnosticsErrors)(parsedTsConfig.errors);
    return parsedTsConfig;
}
//# sourceMappingURL=parse-tsconfig.js.map