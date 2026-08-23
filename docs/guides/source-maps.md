# Source Maps

<div style="color: gray; font-size: 0.9em">Since <b>v9.3.0</b></div>

Playwright-BDD can output source maps alongside generated Playwright test files. Source maps connect locations in these generated tests back to the original `.feature` files, so Playwright reports and IDE integrations can show original scenarios and steps.

## Enable source maps

Set [`sourceMaps`](configuration/options.md#sourcemaps) in the BDD configuration:

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

Run `bddgen` again after enabling the option. It generates an external `.map` file next to each generated Playwright test, which is required for discovery by the Playwright VS Code extension.

?> Use [watch mode](guides/watch-mode.md) to keep these files up to date as features change.

## Playwright VS Code extension

With source maps enabled, the [Playwright VS Code extension](https://playwright.dev/docs/getting-started-vscode) shows the original feature files and their scenarios in the Test Explorer tree instead of the generated test files:

![Feature files and scenarios in the Playwright Test Explorer](./_media/source-maps-tree.png ':size=50%')

You can also run or debug an individual scenario directly from a feature file by clicking the action in the editor gutter next to that scenario:

![Run and debug scenario actions in a feature file gutter](./_media/source-maps-gutter.png ':size=50%')

## Playwright HTML report

Source maps also improve the [Playwright HTML report](reporters/playwright.md). BDD steps show their locations in the original feature file instead of the generated spec file. Expanding a step shows the corresponding Gherkin source snippet with the correct scenario context and highlighted line:

![Feature-file step location and Gherkin source snippet in the Playwright HTML report](./_media/source-maps-in-html-report.png ':size=80%')

?> Generated specs and source maps do not need to be committed. See [Ignore generated files](guides/ignore-generated-files.md) for the recommended `.gitignore` configuration.
