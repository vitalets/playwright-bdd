# Options

## paths

- Type: `string[]`
- Default: `features/**/*.{feature,feature.md}`

Paths to feature files. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features).

## require

- Type: `string[]`
- Default: `features/**/*.(js)`

Paths to step definitions in **CommonJS**. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code).

> Cucumber's option `requireModule: ['ts-node/register']` is not recommended for playwright-bdd. TypeScript compilation is performed with Playwright's built-in loader.

## import

- Type: `string[]`
- Default: `features/**/*.(js)`

Paths to step definitions in [ESM](configuration/esm.md).

## importTestFrom

- Type: `string`

Path to file that exports custom `test` to be used in generated test files.

## outputDir

- Type: `string`
- Default: `.features-gen`

Directory to output generated test files.

## featuresRoot

- Type: `string`
- Default: *location of config file*

Base directory used to construct relative paths to feature files, 
that then used to place test files inside `outputDir`.

The behavior is similar to TypeScript [rootDir](https://www.typescriptlang.org/tsconfig#rootDir) option, that sets common parent for all `.ts` files and actually defines `outDir` structure.

<details>
  <summary>Example</summary>

  Imagine the following project structure:

  ```
  features
    feature1.feature
    subdir
      feature2.feature
  playwright.config.ts 
  ```

  If you generate tests without `featuresRoot` you will get the following output:
  ```
  .features-gen
    features
      feature1.feature.spec.js
      subdir
        feature2.feature.spec.js
  ```

  If you don't want to include `features` directory into output, you can set `featuresRoot: './features'` and then all output paths will be resolved from it:
  ```
  .features-gen
    feature1.feature.spec.js
    subdir
      feature2.feature.spec.js
  ```
</details>

## examplesTitleFormat

- Type: `string`
- Default: `Example #<_index_>`

Title format for `Scenario Outline` examples in generated test files.

## quotes

- Type: `'single' | 'double' | 'backtick'`
- Default: `'double'`

Quotes style in generated test files.

## tags

- Type: `string`

[Tags expression](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions) to filter scenarios for generation. Can be also defined by CLI option `--tags`.

Example:
```ts
const testDir = defineBddConfig({
  tags: '@desktop and not @slow',
  // ...
});
```

## verbose

- Type: `boolean`
- Default: `false`

Verbose output.

## enrichReporterData

- Type: `boolean`
- Default: `undefined`

If this option is enabled, playwright-bdd will add special attachments with BDD data, required for Cucumber reports. It gets enabled automatically, when you use `cucmberReporter()` helper. But for scenarios with [reports merging](reporters/cucumber.md#merge-reports), you need to manually set `enrichReporterData: true` when generating **blob** report.