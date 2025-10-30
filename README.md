# esbuild-plugin-emit-decorator-metadata

## Overview

This is a plugin for [esbuild](https://esbuild.github.io/) to support and the tsconfig setting `"emitDecoratorMetadata": true,`

When the decorator flag is set to `true`, the build process will inspect each .ts file and upon a decorator, will transpile with Typescript.

## Disclaimer

This package is a rewritten version of another package but with correct source map handling. In the original code, source maps were broken, which is why this package was created. Additionally, this module is ESM-only.

Thanks to [Brian McBride](https://github.com/Brian-McBride) for publish his esbuild-decorators package.
[Original Source](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators)

## Usage

Install esbuild and the plugin

```shell
npm install -D esbuild esbuild-plugin-emit-decorators-metadata
```

Set up a esbuild.config.js config, for example:

```typescript
import { esbuildEmitDecoratorMetadata } from "esbuild-plugin-emit-decorators-metadata";
import { resolve } from "path";

module.exports = {
  keepNames: true,
  sourcemap: "linked",
  sourceRoot: path.resolve(__dirname, "src"),
  outExtension: { ".js": ".js" },
  plugins: [
    esbuildEmitDecoratorMetadata({
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
    }),
  ],
};
```

---

### Options

| Option       | Description                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| **tsconfig** | _optional_ : string : The path and filename of the tsconfig.json             |
| **cwd**      | _optional_ : string : The current working directory                          |
| **force**    | _optional_ : boolean : Will transpile ALL `.ts` files to Javascript with tsc |
| **tsx**      | _optional_ : boolean : Enable `.tsx` file support                            |

---

### Caveats

There is no doubt that this will affect the performance of esbuild.
When emitDecoratorMetadata is set, every file will have to be loaded into this plugin.

---
