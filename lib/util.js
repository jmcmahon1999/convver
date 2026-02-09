const fs = require("fs");
const TOML = require("smol-toml");
const YAML = require("yaml");
const path = require("path");
const { exec } = require("child_process");

const execAsync = (command, options) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const parsePrerelease = (prerelease) => {
  if (typeof prerelease === "string") {
    return [true, prerelease];
  }
  if (prerelease) {
    return [true, ""];
  }
  return [false, ""];
};

const readJSON = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

const readTOML = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(TOML.parse(data.toString()));
    });
  });
};

const readYAML = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), "utf8", (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(YAML.parse(data));
    });
  });
};

const readYAMLSync = (filePath) => {
  const data = fs.readFileSync(path.resolve(filePath), "utf8");
  return YAML.parse(data);
};

const writeJSON = (file, obj, spacing) => {
  let json = JSON.stringify(obj, null, spacing);
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(file), json, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const writeTOML = (file, obj) => {
  let tomlString = TOML.stringify(obj);
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(file), tomlString, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const writeYAML = (file, obj) => {
  let yamlString = YAML.stringify(obj);
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(file), yamlString, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const writeYAMLSync = (file, obj) => {
  let yamlString = YAML.stringify(obj);
  return fs.writeFileSync(path.resolve(file), yamlString);
};

const readCommitMessage = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data.toString());
    });
  });
};

module.exports = {
  execAsync,
  parsePrerelease,
  readJSON,
  readTOML,
  readYAML,
  readYAMLSync,
  writeJSON,
  writeTOML,
  writeYAML,
  writeYAMLSync,
  readCommitMessage,
};
