const { valid, clean, gte, inc, prerelease: semverPre } = require("semver");

module.exports = {
  name: "semver",
  description: "Semantic Versioning Scheme. https://semver.org/",
  levels: ["major", "minor", "patch"],
  initialVersion() {
    return "0.0.0";
  },
  verifyVersion(version) {
    const cleanedVersion = valid(clean(version));
    if (cleanedVersion) return cleanedVersion;
    throw new Error(
      `${cleanedVersion} is an invalid semver version. Uncleaned version: ${version}`,
    );
  },
  verifyBump(currentVersion, newVersion) {
    if (gte(newVersion, currentVersion)) return newVersion;
    throw new Error(
      `Invalid increment between ${newVersion} and ${currentVersion}. Check your tag history.`,
    );
  },
  prerelease(version) {
    return semverPre(version);
  },
  bumpVersion(currentVersion, bump, identifier) {
    return inc(currentVersion, bump, identifier);
  },
};
