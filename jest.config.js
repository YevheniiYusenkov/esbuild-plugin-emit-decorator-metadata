module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  transform: { "^.+\\.[tj]sx?$": "ts-jest" },
  globals: { "ts-jest": { tsconfig: "<rootDir>/tsconfig.spec.json" } },
};
