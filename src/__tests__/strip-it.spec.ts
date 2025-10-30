import { readFileSync } from "fs";

import { strip } from "../lib/strip-it";

describe(`Strip It`, () => {
  it(`Can remove comments and strings from text`, () => {
    const testFile = readFileSync(
      `${__dirname}/mock-project/app/src/strip-it.ts.test`,
      "utf-8"
    );

    const result = strip(testFile)
      .replace(/[:=[\]\n]|\s*/g, "")
      .replace(/_/g, " ");

    expect(result).toEqual(
      `THIS SHOULD REALLY ALL BE WHAT'S LEFT OF THE ENTIRE FILE`
    );
  });
});
