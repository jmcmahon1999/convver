const convver = require("../..");
module.exports = {
  command: "plugins",
  describe: "display a list of loaded plugins",
  handler: async () => {
    console.info(convver.plugins());
  },
};
