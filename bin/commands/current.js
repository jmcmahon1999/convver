const convver = require("../../");
module.exports = {
  command: "current [projectType]",
  describe: "return current project version according to git.",
  handler: async () => {
    console.info(await convver.current());
  },
};
