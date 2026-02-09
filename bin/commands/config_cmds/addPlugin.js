const convver = require("../../../");
module.exports = {
  command: "add-plugin <plugin-path>",
  describe: "point convver to a plugin.",
  builder: (yargs) => {
    yargs
      .option("global", {
        alias: "g",
        desc: "add to global configuration",
        type: "boolean",
        default: false,
      })
      .positional("pluginPath", {
        describe: "path to plugin",
        type: "string",
      })
      .group("global", "Options:");
  },
  handler: (argv) => {
    convver.config.addPlugin(argv.pluginPath, argv.global);
  },
};
