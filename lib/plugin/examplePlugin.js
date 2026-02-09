/**
 * Plugin for npm projects.
 */
/* eslint-disable no-unused-vars */
module.exports = {
  name: "example",
  description: "an example project type plugin",
  file: "exampleProjectFile.json",
  /**
   * Read the project file. Should return the contents of the project file in full.
   * @async
   * @returns {Promise<Object>} - object containing project information.
   */
  async read() {
    throw new Error("Example plugin method 'read()' is not implemented.");
  },
  /**
   * Return the version from the project file.
   * @async
   * @param {Object} - object containing project information.
   * @returns {Promise<string>} - project version string.
   */
  async version(project) {
    throw new Error("Example plugin method 'version()' is not implemented.");
  },
  /**
   * Update project file with new version.
   * @param {string} version - semver string representing target version for update.
   */
  async update(version) {
    throw new Error(`Example plugin method 'read()' is not implemented.`);
  },
};
