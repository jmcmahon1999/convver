const fs = require("fs");
const path = require("path");
const os = require("os");
const { readYAMLSync, writeYAMLSync } = require("./util");

const USER_RC_PATH = path.join(os.homedir(), ".convver");
const WORKSPACE_RC_PATH = path.join(process.cwd(), ".convver");

const DEFAULT_CONFIG_PATH = ".convver.yaml";
const DEFAULT_CONFIG_FALLBACK = [
  ".convver.yml",
  path.join(__dirname, "../.convver.default.yaml"),
];
const DEFAULT_PLUGINS = [
  path.join(__dirname, "./plugin/npm"),
  path.join(__dirname, "./plugin/poetry"),
];

const DEFAULT_CONFIG = {
  "config-path": DEFAULT_CONFIG_PATH,
  "config-fallback": DEFAULT_CONFIG_FALLBACK,
  plugins: DEFAULT_PLUGINS,
};

const REQUIRED_CONFIGS = {
  "version-scheme": "string",
  "commit-types": "object",
  "commit-message": "string",
};

const readRunConfig = () => {
  for (let configPath of [WORKSPACE_RC_PATH, USER_RC_PATH]) {
    try {
      if (fs.existsSync(configPath)) return readYAMLSync(configPath);
    } catch (error) {
      throw new Error(`Error reading ${configPath}.`, error);
    }
  }
  return {};
};

const getRunConfig = () => {
  const userConfig = {};
  const loadedConfig = readRunConfig();
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    userConfig[key] = loadedConfig[key] ?? DEFAULT_CONFIG[key];
  }
  if (process.env.CONVVER_CONFIG && fs.existsSync(process.env.CONVVER_CONFIG))
    userConfig["config-path"] = process.env.CONVVER_CONFIG;
  return userConfig;
};

const saveRunConfig = (config, global) => {
  const userConfig = readRunConfig();
  const newConfig = { ...userConfig, ...config };
  writeYAMLSync(global ? USER_RC_PATH : WORKSPACE_RC_PATH, newConfig);
};

const setConfigPath = (configPath) => {
  process.env.CONVVER_CONFIG = configPath;
};

const setVerbosityLevel = (verbosity) => {
  if (verbosity === "quiet" || verbosity === "q" || verbosity === 0) {
    process.env.CONVVER_VERBOSITY = 0;
    return;
  }
  if (verbosity === "auto" || verbosity === "a" || verbosity === 1) {
    process.env.CONVVER_VERBOSITY = 1;
    return;
  }
  if (verbosity === "debug" || verbosity === "d" || verbosity === 2) {
    process.env.CONVVER_VERBOSITY = 2;
    return;
  }
  throw new Error("Invalid verbosity level.");
};

const getVerbosityLevel = () => {
  return process.env.CONVVER_VERBOSITY;
};

const getConfig = () => {
  const userConfig = getRunConfig();
  const configPaths = [
    userConfig["config-path"],
    ...userConfig["config-fallback"],
  ].filter(fs.existsSync);
  if (!configPaths)
    throw Error(
      `Couldn't find config file. Primary ${userConfig["config-path"]} and fallbacks ${userConfig["config-fallbacks"]}`,
    );
  let config = readYAMLSync(configPaths[0]);
  for (let fallback of configPaths.slice(1)) {
    config = { ...readYAMLSync(fallback), ...config };
  }
  for (let key of Object.keys(REQUIRED_CONFIGS)) {
    if (!typeof config[key] == REQUIRED_CONFIGS[key])
      throw Error(`Invalid config for key ${key}.`);
  }
  const scheme = require(`./version/${config["version-scheme"]}`);
  for (let level of scheme.levels) {
    if (!(level in config["commit-types"]) || !config["commit-types"][level]) {
      throw Error(
        `Version scheme ${scheme.name} requires commit-types for level ${level}`,
      );
    }
  }
  if (scheme.defaults) {
    for (let key of scheme.defaults) {
      config[key] = config[key] ?? scheme.defaults[key];
    }
  }
  return config;
};

const setPath = (configPath, global) => {
  saveRunConfig({ "config-path": configPath }, global);
};

const addPlugin = (pluginPath, global) => {
  const userConfig = readRunConfig();
  const plugins = userConfig["plugins"] ?? [];
  saveRunConfig({ plugins: plugins.concat([pluginPath]) }, global);
};

module.exports = {
  saveRunConfig,
  setConfigPath,
  setVerbosityLevel,
  getVerbosityLevel,
  getRunConfig,
  getConfig,
  commands: {
    setPath,
    addPlugin,
  },
};
