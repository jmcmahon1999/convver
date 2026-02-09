const convver = require("../../");
module.exports = {
  command: "local [projectType]",
  describe: "return current project version based on project file.",
  builder: (yargs) => {
    return yargs.positional("projectType", {
      describe: "project file, e.g. npm, poetry",
    });
  },
  handler: async (argv) => {
    console.info(await convver.local(argv.projectType));
  },
};
