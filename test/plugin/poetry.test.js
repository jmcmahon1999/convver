const { local, update } = require("../../");
const semver = require("semver");
const tmp = require("tmp-promise");
const fs = require("fs");

let tmpDir;
let execOpts;

beforeEach(async () => {
  tmpDir = await setupDir();
  execOpts = [tmpDir.path, __filename, global.debug];
});

afterEach(() => {
  cleanupDir(tmpDir);
});

const commitTypes = {
  patch: [["fix", null]],
  minor: [["feat", null]],
  major: [["feat!", null]],
  prepatch: [["fix", "alpha"]],
  preminor: [["feat", "alpha"]],
  premajor: [["feat!", "alpha"]],
};

const setupPoetry = async (opts) => {
  await exec("poetry init -n", ...opts);
  await exec("git add -A", ...opts);
  await exec(`git commit -a -m "chore: npm init"`, ...opts);
  await exec(`git tag -a "v1.0.0" -m "1.0.0"`, ...opts);
};

describe("local", () => {
  test("no-package", async () => {
    const error = await returnError(local, ["poetry"]);
    expect(error.message).toBeDefined();
    expect(
      error.message.startsWith(
        "Could not find project file pyproject.toml for project type poetry",
      ),
    ).toBeTruthy();
  });

  describe("with-package", () => {
    beforeEach(async () => {
      await setupPoetry(execOpts);
    });

    test("projectType=poetry", async () => {
      let version = await local("poetry");
      expect(version).toBeDefined();
      expect(semver.valid(version)).toBeDefined();
    });

    test("projectType detected", async () => {
      let version = await local();
      expect(version).toBeDefined();
      expect(semver.valid(version)).toBeDefined();
    });
  });
});

describe("update", () => {

  beforeEach(async () => {
    await setupPoetry(execOpts);
  });

  test("no-commit", async () => {
    await tmp.file({ dir: tmpDir.path });
    await exec("git add -A", ...execOpts);
    const error = await returnError(update, ["poetry"]);
    expect(error.message).toBeDefined();
    expect(error.message).toBe(
      `Unclean working directory! Commit your changes.`,
    );
  });

  describe.each(Object.keys(commitTypes))("%s", (bump) => {

    test.each(commitTypes[bump])("%s", async (commitType, pre) => {
      await makeConventionalCommit(tmpDir.path, commitType);
      let version = await update("poetry", false, "", pre);
      let fileVersion = await local("poetry");
      expect(version).toBeDefined();
      expect(semver.valid(version)).toBeDefined();
      expect(version).toBe(fileVersion);
      expect(semver.diff("1.0.0", version)).toBe(bump);
      if (bump.includes("pre")) {
        expectedPreID = pre && typeof pre === "string" ? pre : 0;
        expect(semver.prerelease(version)).toBeDefined();
        expect(semver.prerelease(version)[0]).toBe(expectedPreID);
      } else {
        expect(semver.prerelease(version)).toBeNull();
      }
    });
  })
});