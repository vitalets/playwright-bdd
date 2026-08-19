# Watch Mode

<div style="color: gray; font-size: 0.9em">Since <b>v9.3.0</b></div>

Watch mode automatically regenerates test files when your feature files and step files change.

## Start watch mode

Run `bddgen` with `--watch`:

```sh
npx bddgen --watch
```

The initial generation runs immediately. After that, `bddgen` waits for changes and regenerates the tests. If generation fails, watch mode stays active and retries after the next change.

All regular CLI options remain available. For example:

```sh
npx bddgen --watch -c configs/playwright.config.ts --tags "@smoke"
```

## Watched files

By default, `bddgen` watches the nearest `package.json` directory, resolved from the Playwright config. It also always watches the Playwright config file and the directories derived from configured feature and step patterns, even when those directories are outside the nearest `package.json` directory.

By default, changes to feature files and JavaScript or TypeScript files trigger regeneration. The full extension list is configurable through `watch.extensions`.

Some directories are always ignored: `.git`, `node_modules`, and generated output directories.

Use `watch.include` to watch additional dependencies, `watch.exclude` to exclude paths, and `watch.packageRoot` to disable watching the nearest `package.json` directory:

```ts
const testDir = defineBddConfig({
  watch: {
    packageRoot: false,
    include: ['src', '../shared-test-utils', 'data/step-patterns.json'],
    exclude: ['fixtures/downloads'],
    extensions: ['.feature', '.js', '.ts'],
  },
});
```

Included and excluded paths accept plain filesystem paths, not glob patterns, and are resolved relative to the Playwright config. A directly included file bypasses the extension filter, while files inside an included directory remain subject to `watch.extensions`. See the [watch configuration options](configuration/options.md#watch) for details.

## Source maps

Source maps are a great companion for watch mode. When enabled, `bddgen` keeps the mappings from
generated Playwright tests to the original feature files up to date:

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

See the [source maps guide](guides/source-maps.md) for VS Code integration and feature-file
locations in the Playwright HTML report.

## Concurrent generation

When using watch mode, we recommend enabling the [`lockFile` option](configuration/options.md#lockfile):

```ts
const testDir = defineBddConfig({
  lockFile: true,
});
```

This prevents watch mode from rewriting generated tests while Playwright-BDD workers are executing and also coordinates manual `bddgen` runs. Changes detected during test execution are coalesced and generated after the active workers finish.
