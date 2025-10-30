import { inspect } from "util";
export function printDiagnostics(...args) {
    console.log(inspect(args, false, 10, true));
}
export function printDiagnosticsErrors(...args) {
    console.error(inspect(args, false, 10, true));
}
