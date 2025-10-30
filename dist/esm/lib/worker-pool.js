import { Worker } from "node:worker_threads";
import * as os from "node:os";
export class TranspileWorkerPool {
    constructor(size) {
        this.workers = [];
        this.idle = [];
        this.queue = [];
        this.nextId = 1;
        this.inFlight = new Map();
        this.size = Math.max(1, size | 0);
        for (let i = 0; i < this.size; i++)
            this.spawn(i);
    }
    spawn(index) {
        const worker = new Worker(WORKER_CODE, { eval: true });
        this.workers[index] = worker;
        this.idle.push(index);
        worker.on("message", (msg) => {
            const { id } = msg;
            const entry = this.inFlight.get(id);
            if (!entry)
                return;
            this.inFlight.delete(id);
            this.idle.push(index);
            if (msg.ok)
                entry.resolve(msg.code);
            else
                entry.reject(msg.error ?? new Error("Unknown worker error"));
            this.drain();
        });
        worker.on("error", (err) => {
            for (const [id, entry] of this.inFlight) {
                if (entry.workerIndex === index) {
                    this.inFlight.delete(id);
                    entry.reject(err);
                }
            }
            this.workers[index].removeAllListeners();
            this.spawn(index);
            this.drain();
        });
        worker.on("exit", (code) => {
            if (code !== 0) {
                this.spawn(index);
                this.drain();
            }
        });
    }
    drain() {
        while (this.idle.length && this.queue.length) {
            const workerIndex = this.idle.pop();
            const job = this.queue.shift();
            const id = this.nextId++;
            this.inFlight.set(id, {
                workerIndex,
                resolve: job.resolve,
                reject: job.reject,
            });
            this.workers[workerIndex].postMessage({ id, ...job.payload });
        }
    }
    transpile(payload) {
        return new Promise((resolve, reject) => {
            this.queue.push({ payload, resolve, reject });
            this.drain();
        });
    }
    destroy() {
        for (const w of this.workers) {
            try {
                w.terminate();
            }
            catch { }
        }
        this.workers = [];
        this.idle = [];
        this.queue = [];
        this.inFlight.clear();
    }
}
export const getDefaultWorkerCount = () => {
    try {
        const cpus = os?.cpus && typeof os.cpus === "function"
            ? os.cpus()
            : null;
        const count = Array.isArray(cpus) && cpus.length ? cpus.length : 1;
        return Math.max(1, count - 1);
    }
    catch {
        return 1;
    }
};
const WORKER_CODE = `
const { parentPort } = require('node:worker_threads');
const { transpileModule } = require('typescript');

parentPort.on('message', (msg) => {
  const { id, source, fileName, compilerOptions } = msg || {};
  try {
    const program = transpileModule(source, {
      fileName,
      compilerOptions,
      reportDiagnostics: false,
    });
    parentPort.postMessage({ id, ok: true, code: program.outputText });
  } catch (err) {
    parentPort.postMessage({ id, ok: false, error: err && (err.stack || String(err)) });
  }
});
`;
//# sourceMappingURL=worker-pool.js.map