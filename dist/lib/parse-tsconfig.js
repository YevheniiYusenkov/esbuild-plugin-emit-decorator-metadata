import { dirname } from "path";
import { findConfigFile, parseConfigFileTextToJson, parseJsonConfigFileContent, sys, } from "typescript";
import { printDiagnosticsErrors } from "./diagnostics.js";
export function parseTsConfig(tsconfig, cwd = process.cwd()) {
    const fileName = findConfigFile(cwd, sys.fileExists, tsconfig);
    // if the value was provided, but no file, fail hard
    if (tsconfig !== undefined && !fileName)
        throw new Error(`failed to open '${fileName}'`);
    let loadedConfig = {};
    let baseDir = cwd;
    if (fileName) {
        const text = sys.readFile(fileName);
        if (text === undefined)
            throw new Error(`failed to read '${fileName}'`);
        const result = parseConfigFileTextToJson(fileName, text);
        if (result?.error || !result?.config) {
            printDiagnosticsErrors(result.error);
            throw new Error(`failed to parse '${fileName}'`);
        }
        loadedConfig = result.config;
        baseDir = dirname(fileName);
    }
    const parsedTsConfig = parseJsonConfigFileContent(loadedConfig, sys, baseDir);
    if (parsedTsConfig?.errors?.length > 0)
        printDiagnosticsErrors(parsedTsConfig.errors);
    return parsedTsConfig;
}
