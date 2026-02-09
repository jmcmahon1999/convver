const { bump } = require("../../../");

let tmpDir;
let execOpts;

const commitTypes = {
  quiet: [
    ["no-commit", false],
    ["no-commit", true],
    ["docs", false],
    ["docs(scope)", false],
    ["docs", true],
  ],
  patch: [
    ["fix", false],
    ["fix(scope)", false],
  ],
  minor: [
    ["feat", false],
    ["feat(scope)", false],
  ],
  major: [
    ["docs!", false],
    ["fix!", false],
    ["feat!", false],
    ["feat(scope)!", false],
  ],
  prepatch: [
    ["fix", true],
  ],
  preminor: [
    ["feat", true],
  ],
  premajor: [
    ["feat!", true],
  ],
};

beforeEach(async () => {
  tmpDir = await setupDir();
  execOpts = [tmpDir.path, __filename, global.debug];
});

afterEach(() => {
  cleanupDir(tmpDir);
});


describe.each(Object.keys(commitTypes))("%s", (bumpType) => {
  
  test.each(commitTypes[bumpType])("%s", async (commitType, pre) => {
    expect.assertions(2);
    if (commitType !== "no-commit")
      await makeConventionalCommit(tmpDir.path, commitType);
    let increment = await bump(pre);
    expect(increment).toBeDefined();
    expect(increment).toBe(bumpType);
  });
});
