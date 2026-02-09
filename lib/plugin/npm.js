const path = require("path");
const { execAsync, readJSON, writeJSON } = require("../util");
/**
 * Plugin for npm projects.
 */
module.exports = {
  name: "npm",
  description: "project type plugin for npm",
  file: "package.json",
  commitFiles: ["package-lock.json"],
  async read() {
    return await readJSON(path.join(process.cwd(), this.file));
  },
  async version(project) {
    if (!project) project = await this.read();
    return project.version;
  },
  async update(version, jsonSpacing = 4) {
    const project = await this.read();
    project.version = version;
    await writeJSON(this.file, project, jsonSpacing);
    await execAsync("npm i --package-lock-only");
  },
};
