module.exports = {
  command: "config <command>",
  describe: "Manage convver configuration options.",
  builder: (yargs) => {
    return yargs
      .commandDir("config_cmds")
      .demandCommand(1, "You must provide a subcommand!");
  },
};
