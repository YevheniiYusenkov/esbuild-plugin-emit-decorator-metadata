#!/usr/bin/env node
const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const targetDir = join(__dirname, "..", "dist", "cjs");
mkdirSync(targetDir, { recursive: true });

const packageJsonPath = join(targetDir, "package.json");
const packageJsonContent = JSON.stringify({ type: "commonjs" }, null, 2);

writeFileSync(packageJsonPath, `${packageJsonContent}\n`, "utf8");
