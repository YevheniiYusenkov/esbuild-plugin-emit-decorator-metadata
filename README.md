# esbuild-plugin-emit-decorator-metadata

## Overview

This is a plugin for [esbuild](https://esbuild.github.io/) to support the tsconfig setting `"emitDecoratorMetadata": true,` for TypeScript decorators and `reflect-metadata`. It provides fast, optimized handling of decorator metadata with correct source maps, supports both ESM and CommonJS, and offers worker-threads for high performance builds.

When the decorator flag is set to `true`, the build process will inspect each .ts file and upon a decorator, will transpile with Typescript.

## Disclaimer

This package is a rewritten, optimized and improved version of another package by Brian McBride with correct source map handling. In the original code, source maps were broken, which is why this package was created. The distribution now provides both ESM and CommonJS entry points.

This package also has a workers option for better build performance.

Thanks to [Brian McBride](https://github.com/Brian-McBride) for publish his esbuild-decorators package.
[Original Source](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators)

## Usage

Install esbuild and the plugin

```shell
npm install -D esbuild esbuild-plugin-emit-decorator-metadata
```

### ESM configuration example (`esbuild.config.mjs`)

```typescript
import { esbuildEmitDecoratorMetadata } from "esbuild-plugin-emit-decorator-metadata";
import { resolve } from "node:path";

export default {
  keepNames: true,
  sourcemap: "linked",
  sourceRoot: resolve(process.cwd(), "src"),
  outExtension: { ".js": ".js" },
  plugins: [
    esbuildEmitDecoratorMetadata({
      tsconfig: resolve(process.cwd(), "tsconfig.json"),
    }),
  ],
};
```

### CommonJS configuration example (`esbuild.config.cjs`)

```typescript
const {
  esbuildEmitDecoratorMetadata,
} = require("esbuild-plugin-emit-decorator-metadata");
const { resolve } = require("node:path");

module.exports = {
  keepNames: true,
  sourcemap: "linked",
  sourceRoot: resolve(process.cwd(), "src"),
  outExtension: { ".js": ".js" },
  plugins: [
    esbuildEmitDecoratorMetadata({
      tsconfig: resolve(process.cwd(), "tsconfig.json"),
    }),
  ],
};
```

---

### Options

| Option       | Description                                                                         |
| ------------ | ----------------------------------------------------------------------------------- |
| **tsconfig** | _optional_ : string : The path and filename of the tsconfig.json                    |
| **cwd**      | _optional_ : string : The current working directory                                 |
| **force**    | _optional_ : boolean : Will transpile ALL `.ts` files to Javascript with tsc        |
| **tsx**      | _optional_ : boolean : Enable `.tsx` file support                                   |
| **workers**  | _optional_ (_experimental_) : number \| boolean \| "auto" : Controls worker threads |

---

### Caveats

There is no doubt that this will affect the performance of esbuild.
When emitDecoratorMetadata is set, every file will have to be loaded into this plugin.

---

### Performance options

You can control parallel transpilation using the `workers` option:

- `workers: "auto"` (default): spawns a pool with CPU cores - 1 workers.
- `workers: number`: fixed pool size.
- `workers: false`: disables workers; transpilation runs in-process.

ESM example with workers:

```typescript
import { esbuildEmitDecoratorMetadata } from "esbuild-plugin-emit-decorator-metadata";
import { resolve } from "node:path";

export default {
  plugins: [
    esbuildEmitDecoratorMetadata({
      tsconfig: resolve(process.cwd(), "tsconfig.json"),
      workers: "auto",
    }),
  ],
};
```

CJS example with workers:

```typescript
const {
  esbuildEmitDecoratorMetadata,
} = require("esbuild-plugin-emit-decorator-metadata");
const { resolve } = require("node:path");

module.exports = {
  plugins: [
    esbuildEmitDecoratorMetadata({
      tsconfig: resolve(process.cwd(), "tsconfig.json"),
      workers: 4,
    }),
  ],
};
```
