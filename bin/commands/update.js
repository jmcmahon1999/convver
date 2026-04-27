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
      .option("latest", {
        alias: "l",
        desc: "Update the 'latest' tag to point to the new version. If passed without value, the config field 'latest-tag' is used",
        type: "string",
        demandOption: false,
        coerce: (arg) => {
          if (arg === "" || arg === undefined) return true;
          return arg;
        },
      })
      .positional("projectType", {
        describe: "project file, e.g. npm, poetry",
      })
      .conflicts("noTag", "tagMessage")
      .group(["noTag", "tagMessage", "prerelease", "latest"], "Options:");
  },
  handler: async (argv) => {
    console.info(
      await convver.update(
        argv.projectType,
        argv.noTag,
        argv.tagMessage,
        argv.prerelease,
        argv.latest,
      ),
    );
  },
};
