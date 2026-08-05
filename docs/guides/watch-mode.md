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

By default, `bddgen` watches the nearest `package.json` directory, resolved from the Playwright config.

All file types are watched because step definitions can depend on any module in the package. Some directories are always ignored: `.git`, `node_modules`, and generated output directories.

Use `watch.extraPaths` to watch additional paths and `watch.ignorePaths` to ignore some paths:

```ts
const testDir = defineBddConfig({
  watch: {
    extraPaths: ['../shared-steps'],
    ignorePaths: ['fixtures/downloads'],
  },
});
```

These options accept plain filesystem paths, not glob patterns, and are resolved relative to the Playwright config. See the [watch configuration options](configuration/options.md#watch) for details.

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

This coordinates generation when you manually run `bddgen` while `bddgen --watch` is active in another terminal.
