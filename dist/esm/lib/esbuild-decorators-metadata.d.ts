import type { Plugin } from "esbuild";
export interface EsbuildDecoratorsMetadataOptions {
    tsconfig?: string;
    cwd?: string;
    force?: boolean;
    tsx?: boolean;
    workers?: number | "auto" | false;
}
export declare const esbuildDecoratorsMetadata: (options?: EsbuildDecoratorsMetadataOptions) => Plugin;
