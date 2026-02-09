const { execAsync, parsePrerelease } = require("./util");
const { getConfig } = require("./config");

const hasChanges = async () => {
  const command = `git status --untracked-files=no --porcelain`;
  const response = await execAsync(command);
  return !!response;
};

const hasCommits = async (tag) => {
  const command = `git log v${tag}..HEAD`;
  let commits = await execAsync(command);
  return !!commits;
};

const getLocalCommits = async (tag) => {
  const command = `git log v${tag}..HEAD --pretty=format:"%s"`;
  let messages = await execAsync(command);
  return messages.trim().split(/\r?\n/);
};

const gitCommitTypes = async (tag) => {
  const command = `git log v${tag}..HEAD --pretty=format:"%s"`; //  | grep -Eo '^[a-z()!]+'
  let messages = await execAsync(command);
  messages = messages.trim().split(/\r?\n/);
  messages = messages.map((msg) => {
    const match = msg.match(/^[a-z()!]+/);
    return match ? match[0] : null;
  });
  return messages;
};

const checkTag = async (tag) => {
  const command = `git tag -l "v${tag}"`;
  const response = await execAsync(command);
  return !!response;
};

const createTag = async (tag, message, prerelease, projectFile) => {
  const tagMessage = message || tag;
  const [isPrerelease, identifier] = parsePrerelease(prerelease);
  const releaseType = isPrerelease
    ? identifier
      ? identifier
      : "prerelease"
    : "release";
  const commitMessage = `"build(${releaseType}): ${message || getConfig()["commit-message"]} -> ${tag}"`;
  const commitCommand = `git commit -m ${commitMessage} ${projectFile} && git tag -a v${tag} -m ${tagMessage}`;
  const response = await execAsync(commitCommand);
  return response;
};

module.exports = {
  hasChanges,
  hasCommits,
  getLocalCommits,
  gitCommitTypes,
  checkTag,
  createTag,
};
