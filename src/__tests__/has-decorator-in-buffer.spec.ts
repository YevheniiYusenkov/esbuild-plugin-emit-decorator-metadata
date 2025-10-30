import { readFileSync } from "fs";

import { hasDecoratorInBuffer } from "../lib/has-decorator-in-buffer";

describe(`hasDecoratorInBuffer`, () => {
  it(`Can return true if the file has a decorator`, () => {
    const testFile = readFileSync(
      `${__dirname}/mock-project/app/src/mixed-example.ts.test`
    );

    expect(hasDecoratorInBuffer(testFile)).toBe(true);
  });

  it(`Can return false if the file has no decorators`, () => {
    const testFile = readFileSync(
      `${__dirname}/mock-project/app/src/no-decorators.ts.test`
    );

    expect(hasDecoratorInBuffer(testFile)).toBe(false);
  });
});
