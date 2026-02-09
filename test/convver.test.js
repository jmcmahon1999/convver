const { plugins, current } = require("../");
const semver = require("semver");

let tmpDir;
let execOpts;

beforeEach(async () => {
  // Setup Temporary Directory
  tmpDir = await setupDir();
  execOpts = [tmpDir.path, __filename, global.debug];
});

afterEach(async () => {
  cleanupDir(tmpDir);
});

test("plugins", () => {
  let foundPlugins = plugins();
  expect(foundPlugins).toBeDefined();
  expect(foundPlugins).toBeTruthy();
  expect(foundPlugins).toContain("npm");
  expect(foundPlugins).toContain("poetry");
});

describe("current", () => {
  test("no tag", async () => {
    expect.assertions(2);
    await exec(`git tag -d "v0.0.0"`, ...execOpts);
    const error = await returnError(
      current
    );
    expect(error.message).toBeDefined();
    expect(error.message).toBe(`No tag found! Add a v0.0.0 tag to git.`);
  });

  test("with tag", async () => {
    expect.assertions(2);
    let version = await current();
    expect(version).toBeDefined();
    expect(semver.valid(version)).toBeDefined();
  });
});

/*test("convver-version", async () => {
  let version = await convver.version();
  expect(version).toBeDefined();
  expect(semver.valid(version)).toBeDefined();
});

test("convver-bump", async () => {
  let increment = await convver.bump();
  let levels = new Set(["major", "minor", "patch", "quiet", "unsafe"]);
  expect(increment).toBeDefined();
  expect(levels).toContain(increment);
});

test("convver-update", async () => {
  let version = await convver.update("", true, null, null, true);
  expect(semver.valid(version)).toBeDefined();
});*/
