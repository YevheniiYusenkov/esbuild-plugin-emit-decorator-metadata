import type { Plugin } from "esbuild";
export interface EsbuildDecoratorsMetadataOptions {
    tsconfig?: string;
    cwd?: string;
    force?: boolean;
    tsx?: boolean;
}
export declare const esbuildDecoratorsMetadata: (options?: EsbuildDecoratorsMetadataOptions) => Plugin;
