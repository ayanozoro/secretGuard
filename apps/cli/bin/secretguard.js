#!/usr/bin/env node

import { runCli } from "../src/cli.js";

runCli(process.argv.slice(2))
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(err => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${err.message}`);
    process.exit(1);
  });
