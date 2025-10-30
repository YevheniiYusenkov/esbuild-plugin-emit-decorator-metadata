type TranspilePayload = {
    source: string;
    fileName: string;
    compilerOptions: Record<string, unknown>;
};
export declare class TranspileWorkerPool {
    private size;
    private workers;
    private idle;
    private queue;
    private nextId;
    private inFlight;
    constructor(size: number);
    private spawn;
    private drain;
    transpile(payload: TranspilePayload): Promise<string>;
    destroy(): void;
}
export declare const getDefaultWorkerCount: () => number;
export {};
