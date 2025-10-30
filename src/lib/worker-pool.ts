import { Worker } from "node:worker_threads";
import * as os from "node:os";

type TranspilePayload = {
  source: string;
  fileName: string;
  compilerOptions: Record<string, unknown>;
};

type WorkerResponse =
  | { id: number; ok: true; code: string }
  | { id: number; ok: false; error: unknown };

export class TranspileWorkerPool {
  private size: number;
  private workers: Worker[] = [];
  private idle: number[] = [];
  private queue: Array<{
    payload: TranspilePayload;
    resolve: (code: string) => void;
    reject: (err: unknown) => void;
  }> = [];
  private nextId = 1;
  private inFlight = new Map<
    number,
    {
      workerIndex: number;
      resolve: (code: string) => void;
      reject: (err: unknown) => void;
    }
  >();

  constructor(size: number) {
    this.size = Math.max(1, size | 0);
    for (let i = 0; i < this.size; i++) this.spawn(i);
  }

  private spawn(index: number) {
    const worker = new Worker(WORKER_CODE, { eval: true });
    this.workers[index] = worker;
    this.idle.push(index);

    worker.on("message", (msg: WorkerResponse) => {
      const { id } = msg as any;
      const entry = this.inFlight.get(id);
      if (!entry) return;
      this.inFlight.delete(id);
      this.idle.push(index);

      if (msg.ok) entry.resolve(msg.code);
      else
        entry.reject((msg as any).error ?? new Error("Unknown worker error"));

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

  private drain() {
    while (this.idle.length && this.queue.length) {
      const workerIndex = this.idle.pop()!;
      const job = this.queue.shift()!;
      const id = this.nextId++;
      this.inFlight.set(id, {
        workerIndex,
        resolve: job.resolve,
        reject: job.reject,
      });
      this.workers[workerIndex].postMessage({ id, ...job.payload });
    }
  }

  transpile(payload: TranspilePayload) {
    return new Promise<string>((resolve, reject) => {
      this.queue.push({ payload, resolve, reject });
      this.drain();
    });
  }

  destroy() {
    for (const w of this.workers) {
      try {
        w.terminate();
      } catch {}
    }
    this.workers = [];
    this.idle = [];
    this.queue = [];
    this.inFlight.clear();
  }
}

export const getDefaultWorkerCount = () => {
  try {
    const cpus =
      (os as any)?.cpus && typeof (os as any).cpus === "function"
        ? (os as any).cpus()
        : null;
    const count = Array.isArray(cpus) && cpus.length ? cpus.length : 1;
    return Math.max(1, count - 1);
  } catch {
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
