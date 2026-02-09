const path = require("path");
const { readTOML, writeTOML } = require("../util");
/**
 * Plugin for poetry projects.
 */
module.exports = {
  name: "poetry",
  description: "project type plugin for poetry",
  file: "pyproject.toml",
  async read() {
    return await readTOML(path.join(process.cwd(), this.file));
  },
  async version() {
    const project = await this.read();
    let projectVersion = project.project?.version;
    let toolPoetryVersion = project.tool?.poetry?.version;
    if (!projectVersion && !toolPoetryVersion)
      throw Error("Couldn't find version in pyproject.toml file.");
    return projectVersion || toolPoetryVersion;
  },
  async update(version) {
    const project = await this.read();
    project.project.version = version;
    await writeTOML(this.file, project);
  },
};
