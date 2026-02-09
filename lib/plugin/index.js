const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { getRunConfig } = require("../config");

const getGlobalNodeModulesPath = () => {
  try {
    return execSync("npm root -g").toString().trim();
  } catch (error) {
    console.error("Error getting global npm path:", error);
    return null;
  }
};

const getLocalNodeModulesPath = () => {
  try {
    return execSync("npm root").toString().trim();
  } catch (error) {
    console.error("Error getting global npm path:", error);
    return null;
  }
};

const findPlugins = (pluginPath) => {
  if (!pluginPath || !fs.existsSync(pluginPath)) return [];

  const files = fs.readdirSync(pluginPath);
  const namespacePlugins = files
    .filter((dir) => dir.startsWith("@"))
    .map((dir) => path.join(pluginPath, dir))
    .map((dir) => findPlugins(dir))
    .flat();
  const plugins = files
    .filter((dir) => dir.startsWith("convver-"))
    .map((dir) => path.join(pluginPath, dir));
  return plugins.concat(namespacePlugins);
};

const getPlugins = () => {
  const runConfig = getRunConfig();
  const globalNodeModulesPath = getGlobalNodeModulesPath();
  const localNodeModulesPath = getLocalNodeModulesPath();

  const plugins = runConfig.plugins.concat(
    findPlugins(localNodeModulesPath),
    findPlugins(globalNodeModulesPath),
  );

  return plugins
    .map((pkg) => {
      try {
        return require(pkg);
      } catch (error) {
        console.error(`Failed to load plugin ${pkg}:`, error);
        return null;
      }
    })
    .filter(Boolean)
    .reduce((prev, cur) => ({ ...prev, [cur.name]: cur }), {});
};

const validatePlugin = (plugin) => {
  if (fs.existsSync(path.join(process.cwd(), plugin.file))) {
    return plugin;
  }
};

const detectProject = (plugins) => {
  const projects = Object.values(plugins)
    .map((plugin) => {
      return validatePlugin(plugin);
    })
    .filter(Boolean);
  const projectNames = projects.map((p) => p.name);
  const projectFiles = projects.map((p) => p.file);
  if (projects.length == 1) {
    return projects[0];
  } else if (projects.length > 1) {
    throw new Error(
      `Found multiple project files: ${projectFiles.join(", ")}. Try calling "convver local ${[
        projectNames
          .slice(0, projectNames.length - 1)
          .join('", "convver local '),
        ...projectNames.slice(-1),
      ].join('" or "convver local ')}" \n`,
    );
  } else {
    throw new Error(
      `Could not find any supported project file.\n Tried to find: ${Object.keys(plugins)}`,
    );
  }
};

const getPluginForProjectType = (projectType) => {
  const plugins = getPlugins();
  if (!projectType) {
    return detectProject(plugins);
  } else {
    if (Object.keys(plugins).includes(projectType)) {
      const plugin = validatePlugin(plugins[projectType]);
      if (!plugin)
        throw new Error(
          `Could not find project file ${plugins[projectType].file} for project type ${plugins[projectType].name}.`,
        );
      return plugin;
    } else {
      throw new Error(
        `No plugin supporting project type ${projectType}. Installed plugins: ${Object.keys(plugins)}`,
      );
    }
  }
};

module.exports = {
  getPlugins,
  getPluginForProjectType,
};
