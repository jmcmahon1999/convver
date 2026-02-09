const convver = require("../../");
module.exports = {
  command: "hook [commitMessage]",
  describe: "git pre commit hook for enforcing conventional commit messages.",
  builder: (yargs) => {
    return yargs
      .option("text", {
        alias: "t",
        desc: "Skip loading from file and treat commitMessage as a raw commit message string.",
        type: "boolean",
        demandOption: false,
      })
      .positional("commitMessage", {
        describe: "commit message file.",
      })
      .group("text", "Options:");
  },
  handler: async (argv) => {
    console.info(await convver.hook(argv.commitMessage, argv.text));
  },
};
