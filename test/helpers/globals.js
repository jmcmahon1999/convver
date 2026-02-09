const util = require("util");
const fs = require("fs");
const tmp = require("tmp-promise");
const execPromise = util.promisify(require("child_process").exec);
const { debug } = require("console");

tmp.setGracefulCleanup();

global.originCwd = process.cwd();

global.exec = async function (cmd, dir, suite, verbose) {
  try {
    const response = await execPromise(cmd, { cwd: dir });
    if (verbose) {
      debug(cmd.split(" ", 2).join(" "), String.fromCharCode(response));
    }
  } catch (e) {
    throw Error(`${suite}: Error running command ${cmd}: ${e} \n cwd: ${dir}`);
  }
};

global.chdir = function (dir) {
  try {
    process.chdir(dir);
  } catch (e) {
    console.error(`Could not access working directory: ${dir}. \n ${e}`);
  }
};

global.returnError = async (func, params=[]) => {
  try {
    await func(...params);
    return;
  } catch (e) {
    return e;
  }
}

global.setupDir = async function () {
  // Setup Temporary Directory
  const tmpDir = await tmp.dir({ unsafeCleanup: true });
  await tmp.file({ dir: tmpDir.path });

  // Change Working Directory.
  chdir(tmpDir.path);

  // Initialize Git Repository
  execOpts = [tmpDir.path, __filename, global.debug];
  await exec("git init", ...execOpts);
  await exec("git add -A", ...execOpts);
  await exec(`git commit -a -m "initial commit"`, ...execOpts);
  await exec(`git tag -a "v0.0.0" -m "0.0.0"`, ...execOpts);
  return tmpDir;
};

global.cleanupDir = function (tmpDir) {
  chdir(originCwd);
  tmpDir.cleanup();
  if (!fs.existsSync(tmpDir.path) && global.debug)
    console.debug(`Successfully cleaned up ${tmpDir.path}`);
}

global.makeConventionalCommit = async (dir, commitType) => {
  const tmpFile = await tmp.file({ dir: dir });
  await exec(`git add ${tmpFile.path}`);
  await exec(`git commit -a -m "${commitType}: ${tmpFile.path}"`);
}