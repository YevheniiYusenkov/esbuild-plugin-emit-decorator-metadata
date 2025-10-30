"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printDiagnostics = printDiagnostics;
exports.printDiagnosticsErrors = printDiagnosticsErrors;
const util_1 = require("util");
function printDiagnostics(...args) {
    console.log((0, util_1.inspect)(args, false, 10, true));
}
function printDiagnosticsErrors(...args) {
    console.error((0, util_1.inspect)(args, false, 10, true));
}
//# sourceMappingURL=diagnostics.js.map