# Watch Mode

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

Source maps are a great companion for watch mode. When enabled, `bddgen` outputs source-maps for generated Playwright tests.
You can enable it in the BDD configuration:

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

With source maps enabled, the Playwright VS Code extension shows the original feature files and their scenarios in the Test Explorer tree instead of the generated test files.

![Feature files and scenarios in the Playwright Test Explorer](./_media/source-maps-tree.png ':size=50%')

You can also run or debug an individual scenario directly from a feature file by clicking the action in the editor gutter next to that scenario.

![Run and debug scenario actions in a feature file gutter](./_media/source-maps-gutter.png ':size=50%')

## Concurrent generation

By default, `bddgen` coordinates concurrent generation for the same output directory. This is mainly useful when you manually run `bddgen` while `bddgen --watch` is active in another terminal. If the default behavior causes problems in your environment, see the [`lockFile` option](configuration/options.md#lockfile).
