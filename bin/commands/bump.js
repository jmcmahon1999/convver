const convver = require("../../");
module.exports = {
  command: "bump",
  describe: "return the bump level required based on commit message types",
  builder: (yargs) => {
    return yargs
      .option("prerelease", {
        alias: "p",
        desc: "Treat bump as a prerelease.",
        type: "boolean",
      })
      .group("prerelease", "Options:");
  },
  handler: async (argv) => {
    console.info(await convver.bump(argv.prerelease ?? false));
  },
};
