const {
  hasChanges,
  hasCommits,
  getLocalCommits,
  checkTag,
  createTag,
} = require("./lib/git");
const {
  checkCommits,
  getChanges,
  validateCommitMessage,
} = require("./lib/commits");
const {
  getConfig,
  setConfigPath,
  setVerbosityLevel,
  getVerbosityLevel,
  commands,
} = require("./lib/config");
const { getPlugins, getPluginForProjectType } = require("./lib/plugin");
const { parsePrerelease, readCommitMessage } = require("./lib/util");
const { gitDescribe } = require("git-describe");

/**
 * Return the local version defined by a project.
 * @async
 * @param {string} projectType - type of project, e.g. poetry, npm etc.
 * @returns {Promise<string>} - semver string
 */
const local = async (projectType) => {
  const project = getPluginForProjectType(projectType);
  return project.version();
};

/**
 * Return the current version according to git.
 * @async
 * @returns {Promise<string>} - semver string
 */
const current = async () => {
  const config = getConfig();
  const scheme = require(`./lib/version/${config["version-scheme"]}`);
  const meta = await gitDescribe(process.cwd());
  if (!meta.semver) {
    throw new Error(`No tag found! Add a v0.0.0 tag to git.`);
  }
  return scheme.verifyVersion(meta.semver.version || meta.tag);
  // TODO: Sanity check for local and git versions.
};

/**
 * Return the updated version according to git messages.
 * @async
 * @param {string} prerelease - prerelease identifier, if set the version is treated as a prerelease.
 * @returns {Promise<string>} - semver string
 */
const version = async (prerelease) => {
  const config = getConfig();
  const scheme = require(`./lib/version/${config["version-scheme"]}`);
  const currentVersion = await current();
  const [isPrerelease, identifier] = parsePrerelease(prerelease);
  const change = await bump(isPrerelease);
  if (change == "quiet") return currentVersion;
  const newVersion = scheme.bumpVersion(currentVersion, change, identifier);
  return newVersion;
};

/**
 * Return the required version increment according to git messages.
 * @param {boolean} prerelease - version bump is a prerelease.
 * @returns {Promise<string>} - semver version increment.
 */
const bump = async (prerelease) => {
  const commitTypes = getConfig()["commit-types"];
  const currentVersion = await current();
  const hasNewCommits = await hasCommits(currentVersion);
  if (!hasNewCommits) return "quiet";
  const commitMessages = await getLocalCommits(currentVersion);
  const commits = checkCommits(commitMessages, commitTypes);
  const changes = getChanges(commits, commitTypes);
  if (!changes[0]) {
    throw new Error("Invalid semver bump!");
  }
  if (prerelease && changes[0] !== "quiet") return `pre${changes[0]}`;
  return changes[0];
};

/**
 * Update the project file with the new version.
 * @async
 * @param {string} projectType - type of project, e.g. poetry, npm etc.
 * @param {boolean} noTag - update project files without creating git tag.
 * @param {string} tagMessage - git tag message string.
 * @param {string} prerelease - prerelease identifier; if set, the version is treated as a prerelease.
 */
const update = async (projectType, noTag, tagMessage, prerelease) => {
  const config = getConfig();
  const scheme = require(`./lib/version/${config["version-scheme"]}`);
  if (await hasChanges()) {
    throw new Error(`Unclean working directory! Commit your changes.`);
  }
  const project = getPluginForProjectType(projectType);
  const commitFiles = project?.commitFiles || [];
  commitFiles.push(project.file);
  const currentVersion = await current();
  const newVersion = scheme.verifyBump(
    currentVersion,
    await version(prerelease),
  );
  if (newVersion == currentVersion) return currentVersion;
  if (!noTag && (await checkTag(newVersion))) {
    throw new Error(`Tag 'v${newVersion}' already exists.`);
  }
  await project.update(newVersion);
  let response = "Changes not committed.";
  if (!noTag)
    response = await createTag(newVersion, tagMessage, prerelease, commitFiles);
  if (getVerbosityLevel() > 0) {
    console.info(`Version Bumped: v${currentVersion} -> v${newVersion}`);
  }
  if (getVerbosityLevel() > 1) {
    console.info(response);
  }
  return newVersion;
};

/**
 * Return a list of available plugins.
 * @returns {Array<string>} - list of plugins
 */
const plugins = () => {
  return Object.keys(getPlugins());
};

const hook = async (commitMessage, isText) => {
  if (!isText) commitMessage = await readCommitMessage(commitMessage);
  const commitTypes = getConfig()["commit-types"];
  const result = validateCommitMessage(commitMessage, commitTypes);
  if (!result)
    throw Error("Commit message does not conform to Conventional Commits.");
};

module.exports = {
  local,
  current,
  version,
  bump,
  update,
  plugins,
  hook,
  config: {
    getConfig,
    setConfigPath,
    setVerbosityLevel,
    ...commands,
  },
};
