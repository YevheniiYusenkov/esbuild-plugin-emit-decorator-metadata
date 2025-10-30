# Changelog

# 0.2.1

- Added tags to package.json

## 0.2.0

- Added worker pool for parallel transpilation (workers option: number | "auto" | false).
- Massive performance improvements:
  - Fast Buffer-based decorator scan (no full regex/strip pass, early exit).
  - Skip .d.ts files.
  - No onLoad registration when emitDecoratorMetadata is disabled and force is not set.
- Improved README with ESM/CJS examples and performance options.

## 0.1.0

- Dual package output: ESM and CommonJS (exports, main, module adjusted).
- Disclaimer added about rewritten source with correct source map handling.

## 0.0.x

- Initial plugin implementation to support emitDecoratorMetadata with esbuild.
