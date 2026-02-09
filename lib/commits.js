const conventionalCommitRegex = (commitTypes) => {
  const allTypes = Object.values(commitTypes).reduce(
    (acc, arr) => acc.concat(arr),
    [],
  );
  const escapedTypes = allTypes
    .map((type) => type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(
    `^` +
      `(?<type>${escapedTypes})` +
      `(?:\\((?<scope>[^)]+)\\))?` +
      `(?<breaking>!)?` +
      `:\\s+` +
      `(?<description>[\\s\\S]+)` +
      `$`,
  );
};

const getCommits = (messages, commitTypes) => {
  return messages.map((m) => parseCommit(m, commitTypes));
};

const checkCommits = (messages, commitTypes) => {
  const commits = getCommits(messages, commitTypes);
  if (!commits[0].type)
    throw new Error(`Unconventional commit ${commits[0].description} at HEAD.`);
  if (commitTypes["unsafe"].includes(commits[0].type) || !commits[0].type)
    throw new Error(`Unsafe commit type ${commits[0].type} at HEAD.`);
  return commits;
};

const validateCommitMessage = (message, commitTypes) => {
  message = message.trim().replace(/\r\n/g, "\n");
  if (message.startsWith("Merge") || message.startsWith("Revert")) {
    console.info("Skipping commit-message hook for Merge or Revert.");
    return true;
  }
  return conventionalCommitRegex(commitTypes).test(message);
};

const parseCommit = (message, commitTypes) => {
  const regex = conventionalCommitRegex(commitTypes);
  message = message.trim().replace(/\r\n/g, "\n");

  const match = message.match(regex);
  return {
    type: match?.groups.type,
    scope: match?.groups.scope ?? null,
    breaking: Boolean(match?.groups.breaking),
    description: match ? match.groups.description : message,
  };
};

const getChanges = (commits, commitTypes) => {
  const levels = Object.keys(commitTypes);
  const messageTypes = commits.map((c) => (c.breaking ? "breaking" : c.type));
  const changes = levels.filter((k) =>
    commitTypes[k].some((m) => messageTypes.includes(m)),
  );
  return changes;
};

module.exports = {
  validateCommitMessage,
  getCommits,
  checkCommits,
  parseCommit,
  getChanges,
};
