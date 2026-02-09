const { version } = require("../../..");
const semver = require("semver");
const { debug } = require("console");

let tmpDir;
let execOpts;

const commitTypes = {
  quiet: [
    ["no-commit", null],
    ["no-commit", "alpha"],
    ["docs", null],
    ["docs(scope)", null],
    ["docs", true],
  ],
  patch: [
    ["fix", null],
    ["fix(scope)", null],
  ],
  minor: [
    ["feat", null],
    ["feat(scope)", null],
  ],
  major: [
    ["docs!", null],
    ["fix!", null],
    ["feat!", null],
    ["feat(scope)!", null],
  ],
  prepatch: [
    ["fix", true],
    ["fix", ""],
    ["fix", "alpha"],
    ["fix(scope)", "alpha"],
  ],
  preminor: [["feat", "alpha"]],
  premajor: [["feat!", "alpha"]],
};

beforeEach(async () => {
  tmpDir = await setupDir();
  execOpts = [tmpDir.path, __filename, global.debug];
});

afterEach(() => {
  cleanupDir(tmpDir);
});

describe.each(Object.keys(commitTypes))("%s", (bump) => {
  test.each(commitTypes[bump])("%s", async (commitType, pre) => {
    if (commitType !== "no-commit")
      await makeConventionalCommit(tmpDir.path, commitType);
    let newVersion = await version(pre);
    expect(newVersion).toBeDefined();
    expect(semver.valid(newVersion)).toBeDefined();
    if (bump === "quiet") expect(semver.diff("0.0.0", newVersion)).toBeNull();
    else expect(semver.diff("0.0.0", newVersion)).toBe(bump);
    if (bump.includes("pre")) {
      expectedPreID = pre && typeof pre === "string" ? pre : 0;
      expect(semver.prerelease(newVersion)).toBeDefined();
      expect(semver.prerelease(newVersion)[0]).toBe(expectedPreID);
    } else {
      expect(semver.prerelease(newVersion)).toBeNull();
    }
  });
});
