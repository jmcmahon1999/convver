# convver
Automatically versioning repositories with the [SemVer](https://semver.org/), [CalVer](https://calver.org/) and [Conventional Versioning](https://www.conventionalcommits.org/en/v1.0.0/) conventions.


> This tool is intended for **casual projects**. You should probably be intentionally keeping track of versions when developing real software.


Your project must use a single-source project version.


Currently supported project types:
- [npm](https://www.npmjs.com/) (package.json)
- [poetry](https://python-poetry.org) (pyproject.toml)

Plugins for other project types:
- [packwiz](https://packwiz.infra.link/) (pack.toml): [convver-packwiz](https://github.com/jmcmahon1999/convver-packwiz)


### Usage

As a node module:
```js
const convver = require('convver')

// get version from package.json.
convver.local('npm') // '1.2.3'

// get version from pyproject.toml.
convver.local('poetry') // '1.2.3'

// get version from git tags
convver.current() // '1.2.3'

// get bump level from commits.
convver.bump() // 'minor'

// optionally mark the bump as a prerelease.
convver.bump(true) // 'pre-minor'

// get new version from commits.
convver.version() // '1.3.0'

// optionally mark the version as a prerelease.
convver.version('alpha') // '1.3.0-alpha

// update package.json, commit changes and create tag.
// tag name defaults to the version string.
convver.update('npm') // '1.3.0'

// options: 
// projectType: string (required) - type of project, e.g. 'poetry', 'npm' etc.
// noTag: boolean - update project files without creating git tag.
// tagMessage: string - custom tag name.
// prerelease: string - prerelease identifier; if set, the version is treated as a prerelease.
convver.update('npm', false, "MyVersionName", "alpha")
```

As a CLI:
```sh
convver --help # get help.
convver --help <command> # get help for a command.

# get version from package.json.
convver local npm // '1.2.3'

# get version from git tags
convver current # '1.2.3'

# get bump level from commits.
convver bump # 'minor'

# optionally mark the bump as a prerelease.
convver bump -p # 'pre-minor'

# get new version from commits.
convver version # '1.3.0'

# optionally mark the version as a prerelease.
convver version --prerelease 'alpha' # '1.3.0-alpha

# update package.json, commit changes and create tag.
# tag name defaults to the version string.
convver update npm # '1.3.0'

# update with custom version name.
# Version string is SemVer format, but tag title will be MyVersionName.
convver update npm -m 'MyVersionName' -p 'alpha' # '1.3.0-alpha'
```

### Configuration

This package by default tries to find config files at either `./.convver.yaml` or `./.convver.yml`. If none are found it falls back to the included [`.convver.default.yaml`](/.convver.default.yaml)

Configuration path can be set using the environment variable `CONVVER_CONFIG` or using a run-config YAML file `.convver`. If `CONVVER_CONFIG` is not set, first the current working directory then `$USER_HOME` will be searched for a `.convver` file.

#### Example SemVer Configuration:

```yaml
version-scheme: semver  # Required
commit-types:           # Required
  major:                # At least one entry required
    - breaking
  minor:                # At least one entry required
    - feat
  patch:                # At least one entry required
    - fix
    - refactor
    - style
    - ops
    - build
  quiet:                # Optional
    - docs
    - test
    - ci
  unsafe:               # Optional
    - chore
commit-message: convver automatic versioning. # Required
```

#### Example CalVer Configuration:
> Not yet thoroughly tested.

```yaml
version-scheme: calver  # Required
cycle: daily            # Optional, default: monthly
commit-types:           # Required
  major:                # At least one entry required
    - breaking
  minor:                # At least one entry required
    - feat
  quiet:                # Optional
    - docs
    - test
    - ci
  unsafe:               # Optional
    - chore
commit-message: convver automatic versioning. # Required
```

#### Run Config:

Config functions in node:
```js
convver.getConfig() // get configuration object.
convver.setConfigPath('path/to/my/config') // sets env.CONVVER_CONFIG.
convver.setVerbosityLevel('auto') // sets env.CONVVER_VERBOSITY
    // accepts (0, 1, 2) or ('q', 'a', 'd') or ('quiet', 'auto', 'debug') 

convver.setPath('path/to/my/config') // sets run-config path (in a .convver file)

```


```yaml
config-path: path/to/my/config
config-fallback: path/to/my/config-fallback
plugins:
  - path/to/my/convver/plugin
  - path/to/another/convver/plugin
```

### Examples

#### Commit Message Hook:

```sh
#!/bin/sh
# commit-msg hook for convver

MSG_FILE="$1"

npx --no-install convver hook "$MSG_FILE"
status=$?

if [ $status -ne 0 ]; then
  echo "✗ Commit message does not conform to Conventional Commits."
  echo "  Fix the message and try again."
  exit 1
fi

exit 0
```
Store at `.git/hooks/commit-msg` and enable with `chmod +x`.


#### GitHub Actions Workflow:

Suggested order for CI jobs:
- Run Tests
- Update Version if tests pass.
- Build distributables.
- Create Github release/publish package.


```yaml
on:
  push:
    branches:
      - main
jobs:
  build:
    # ---
    # Verify build script and tests.
    # -
    # -
    # ----
  version:
    needs: build
    runs-on: ubuntu-latest
    outputs:
        tag: ${{ steps.convver-version.outputs.tag }}
    steps:
      # Checkout repo with tag history.
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          fetch-tags: true

      # Setup node and convver.
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm install -g @jmcmahon1999/convver --@jmcmahon1999:registry=https://npm.pkg.github.com/ 
      
      # Set git credentals
      - run: |
          git config --global user.name "${GITHUB_ACTOR}"
          git config --global user.email "${GITHUB_ACTOR}@users.noreply.github.com"
    
      # Update project version with convver.
      - name: Convver Update
        id: convver-update
        run: convver update npm -q

      - name: Get New Version
        id: convver-version
        run: echo "$( convver current npm)" >> $GITHUB_OUTPUT

      # Push changes and create release.
      - name: Push Changes
        if: steps.convver-update.outcome == 'success'
        run: git push --follow-tags

  build:
    # ---
    # Build distributions with the updated version.
    # -
    # -
    # ---

  release:
    needs: build
    runs-on: ubuntu-latest
    env:
      TAG: ${{ needs.version.outputs.tag }}
    steps:
      - name: Create release
        env:
          GITHUB_TOKEN: ${{ secrets.MY_PAT }}
        run: |
          gh release create ${TAG/#/v} \
            --repo="$GITHUB_REPOSITORY" \
            --title="${TAG#v}" \
            --generate-notes
```
An example workflow `.github/workflows/version.yml`.