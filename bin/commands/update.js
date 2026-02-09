const convver = require("../../");
module.exports = {
  command: "update [projectType]",
  describe: "update the project file with the new version",
  builder: (yargs) => {
    return yargs
      .option("noTag", {
        alias: "n",
        desc: "Update project files without creating git tag.",
        type: "boolean",
        default: false,
      })
      .option("tagMessage", {
        alias: "m",
        desc: "Git tag message string.",
        type: "string",
        demandOption: false,
      })
      .option("prerelease", {
        alias: "p",
        desc: "Prerelease identifier, if set the version is treated as a prerelease.",
        type: "string",
        demandOption: false,
      })
      .positional("projectType", {
        describe: "project file, e.g. npm, poetry",
      })
      .conflicts("noTag", "tagMessage")
      .group(["noTag", "tagMessage", "prerelease"], "Options:");
  },
  handler: async (argv) => {
    console.info(
      await convver.update(
        argv.projectType,
        argv.noTag,
        argv.tagMessage,
        argv.prerelease,
      ),
    );
  },
};
