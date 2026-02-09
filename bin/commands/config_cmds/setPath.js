const convver = require("../../../");
module.exports = {
  command: "set-path <path>",
  describe: "Update the default path to convver configuration.",
  builder: (yargs) => {
    yargs
      .option("global", {
        alias: "g",
        desc: "apply option to global configuration",
        type: "boolean",
        default: false,
      })
      .positional("path", {
        describe: "path to configuration file.",
        type: "string",
      })
      .group("global", "Options:");
  },
  handler: (argv) => {
    convver.config.setPath(argv.path, argv.global);
  },
};
