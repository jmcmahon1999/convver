const { valid, clean, nt, cycle, minor, suffix, initial } = require("calver");

module.exports = {
  name: "calver",
  description: "Calendar Versioning Scheme. https://calver.org/",
  levels: ["major", "minor"],
  defaults: {
    cycle: "monthly",
  },
  initialVersion(cycle) {
    return initial({ cycle: cycle ?? "month" });
  },
  verifyVersion(version) {
    const cleanedVersion = valid(clean(version));
    if (cleanedVersion) return cleanedVersion;
    throw new Error(
      `${cleanedVersion} is an invalid calver version. Uncleaned version: ${version}`,
    );
  },
  verifyBump(currentVersion, newVersion) {
    if (currentVersion == newVersion || nt(newVersion, currentVersion))
      return newVersion;
    throw new Error(
      `Invalid increment between ${newVersion} and ${currentVersion}. Check your tag history.`,
    );
  },
  pererelease(version) {
    let [version_part, number] = version.split(".");
    let identifier = version_part.split("-")[-1];
    return { identifier, number };
  },
  bumpVersion(currentVersion, bump, identifier) {
    let newVersion = currentVersion;
    if (bump == this.levels[0]) newVersion = cycle(newVersion, bump);
    if (bump == this.levels[1]) newVersion = minor(newVersion, bump);
    if (identifier) newVersion = suffix(newVersion, identifier);
    return newVersion;
  },
};
