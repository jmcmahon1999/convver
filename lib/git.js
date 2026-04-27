const { execAsync, parsePrerelease } = require("./util");

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
  const command = `git tag -l "${tag}"`;
  const response = await execAsync(command);
  return !!response;
};

const createTag = async (tag, message, prerelease, commitFiles) => {
  const [isPrerelease, identifier] = parsePrerelease(prerelease);
  const releaseType = isPrerelease
    ? identifier
      ? identifier
      : "prerelease"
    : "release";
  const commitMessage = `"build(${releaseType}): ${message} -> ${tag}"`;
  const commitCommand = `git commit -m ${commitMessage} ${commitFiles.join(" ")} && git tag -a v${tag} -m ${tag}`;
  const response = await execAsync(commitCommand);
  return response;
};

const updateLatestTag = async (tag) => {
  let latestTagCommand = `git tag -fa ${tag} -m ${tag}`;
  const response = await execAsync(latestTagCommand);
  return response;
};

module.exports = {
  hasChanges,
  hasCommits,
  getLocalCommits,
  gitCommitTypes,
  checkTag,
  createTag,
  updateLatestTag,
};
