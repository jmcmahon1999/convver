#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const convver = require("../");

const configPathHandler = (argv) => {
  if (argv.configPath) convver.config.setConfigPath(argv.configPath);
};

const verbosityHandler = (argv) => {
  if (argv.debug) {
    convver.config.setVerbosityLevel("debug");
    return;
  }
  if (argv.quiet) {
    convver.config.setVerbosityLevel("quiet");
    return;
  }
  convver.config.setVerbosityLevel("auto");
  return;
};

const parser = yargs(hideBin(process.argv))
  .middleware([configPathHandler, verbosityHandler])
  .commandDir("commands")
  .option("configPath", {
    alias: "c",
    type: "string",
    description: "path to config file",
  })
  .option("quiet", {
    alias: "q",
    type: "boolean",
    description: "suppress command logging.",
  })
  .option("debug", {
    type: "boolean",
    description: "enable verbose debug logs.",
  })
  .group(["configPath", "quiet", "debug", "help", "version"], "Global Options:")
  .demandCommand(1, "You must provide a command!")
  .fail(false);

const cli = async () => {
  try {
    await parser.parse();
    process.exit(0);
  } catch (e) {
    console.error(`${e.message} \n${await parser.getHelp()}`);
    process.exit(1);
  }
};

cli();
