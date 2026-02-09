const convver = require("../../");
module.exports = {
  command: "version",
  describe: "return the new version based on commit message types",
  builder: (yargs) => {
    return yargs
      .option("prerelease", {
        alias: "p",
        desc: "Prerelease identifier, if set the version is treated as a prerelease.",
        type: "string",
        demandOption: false,
      })
      .group("prerelease", "Options:");
  },
  handler: async (argv) => {
    console.info(await convver.version(argv.prerelease));
  },
};
