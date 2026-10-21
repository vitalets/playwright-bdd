# Source Maps

<div style="color: gray; font-size: 0.9em">Since <b>v10.0.0</b></div>

Playwright-BDD can embed inline source maps in generated Playwright test files. Source maps connect locations in these generated tests back to the original `.feature` files, so Playwright reports and IDE integrations can show original scenarios and steps.

## Enable source maps

Set `sourceMaps` in the BDD configuration:

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

Run `bddgen` again after enabling the option. It embeds the source map as a base64 data URL at the end of each generated Playwright test. No separate `.map` files are generated.

## Playwright VS Code extension

Source maps require [Playwright VS Code extension](https://playwright.dev/docs/getting-started-vscode) **v1.1.20 or later**.

**Keep `npx bddgen --watch` running. After editing files, press Ctrl+S (Cmd+S on macOS), or click outside the editor if Auto Save on focus change is enabled, so watch mode can pick up the saved changes.**

With source maps enabled, the Playwright VS Code extension shows the original feature files and their scenarios in the Test Explorer tree instead of the generated test files:

![Feature files and scenarios in the Playwright Test Explorer](./_media/source-maps-tree.png ':size=50%')

You can also run or debug an individual scenario directly from a feature file by clicking the action in the editor gutter next to that scenario:

<video controls preload="metadata" style="width: 65%; height: auto; display: block; margin: 1em 0;" aria-label="Source maps support demo">
  <source src="release-notes/_media/v10-source-maps.mp4" type="video/mp4">
</video>

## Playwright HTML report

Source maps also improve the [Playwright HTML report](reporters/playwright.md). BDD steps show their locations in the original feature file instead of the generated spec file. Expanding a step shows the corresponding Gherkin source snippet with the correct scenario context and highlighted line:

![Feature-file step location and Gherkin source snippet in the Playwright HTML report](./_media/source-maps-in-html-report.png ':size=80%')
