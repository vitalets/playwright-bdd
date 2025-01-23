# Options

## features

?> Since Playwright-BDD **v7**, this option has replaced Cucumber's `paths`.

- **Type:** `string | string[]`
- **Default:** `undefined`

Path(s) to feature files. Can be a directory or [glob pattern](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax).
Example: `features/**/*.feature`.
If you don't specify a file extension, the default is `*.feature`.
Resolved relative to the config file location.

> Since Playwright-BDD **v8**, you can omit the `features` option and define [`featuresRoot`](#featuresroot), which serves as a common base directory for both features and steps. The features glob pattern will be calculated as `{featuresRoot} + /**/*.feature`.

## steps

?> Since v7, this option replaced Cucumber's `require`, `import`, and `requireModule`.

- **Type:** `string | string[]`
- **Default:** `undefined`

Path(s) to step definitions. Can be a directory or [glob pattern](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax).
Example: `steps/**/*.ts`.
If you don't specify a file extension, the default is `*.{js,mjs,cjs,ts,mts,cts}`.
Resolved relative to the config file location.

> Since Playwright-BDD **v8**, you can omit the `steps` option and define [`featuresRoot`](#featuresroot), which serves as a common base directory for both features and steps. The steps glob pattern will be calculated as `{featuresRoot} + /**/*.{js,mjs,cjs,ts,mts,cts}`.

## outputDir

- **Type:** `string`
- **Default:** `.features-gen`

Directory to output generated test files. Resolved relative to the config file location.

## featuresRoot

- **Type:** `string`
- **Default:** *location of config file*

Base directory to construct generated file paths inside `outputDir`. Resolved relative to the config file location. Note that `featuresRoot` is a directory and cannot contain glob patterns (`*`).

The behavior is similar to TypeScript's [rootDir](https://www.typescriptlang.org/tsconfig#rootDir) option, which sets a common parent for all `.ts` files and defines the `outDir` structure.

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

  If you generate tests without `featuresRoot`, you will get the following output:
  ```
  .features-gen
    features
      feature1.feature.spec.js
      subdir
        feature2.feature.spec.js
  ```

  If you don't want to include the `features` directory in the output, you can set `featuresRoot: './features'` and then all output paths will be resolved from it:
  ```
  .features-gen
    feature1.feature.spec.js
    subdir
      feature2.feature.spec.js
  ```
</details>

Since **Playwright-BDD v8**, `featuresRoot` serves as a default directory for both `features` and `steps`, if these options are not explicitly defined. This allows for more concise configurations.

Before v8:
```js
const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: './features/steps/**/*.js',
  featuresRoot: './features',
});
```

Since v8:
```js
const testDir = defineBddConfig({
  featuresRoot: './features',
});
```

You can still run a subset of features if needed:
```js
const testDir = defineBddConfig({
  featuresRoot: './features',
  features: './features/game/*.feature', // <- run only these features
});
```

## language

- **Type:** `string`
- **Default:** `en`

Default [language](https://cucumber.io/docs/gherkin/reference/#spoken-languages) for your feature files. 

## aiFix

- **Type:** `object`
- **Default:** `undefined`

A set of options for fixing failed tests with AI.

#### Sub options
  * `promptAttachment` *boolean* - Whether to attach AI prompt to failling tests
  * `promptAttachmentName` *string* - Custom name for prompt attachment
  * `promptTemplate` *string* - Custom template for prompt (here is [default](https://github.com/vitalets/playwright-bdd/blob/main/src/ai/promptTemplate.ts))

Example:

```js
const testDir = defineBddConfig({
  aiFix: {
    promptAttachment: true,
  },
  // ...other options
});
```

## examplesTitleFormat

- **Type:** `string`
- **Default:** `Example #<_index_>`

Title format for `Scenario Outline` examples in generated test files.

## quotes

- **Type:** `'single' | 'double' | 'backtick'`
- **Default:** `'single'`

Quotes style in generated test files.

## tags

- **Type:** `string`

[Tags expression](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions) to filter scenarios for generation. Can also be defined by the CLI option `--tags`.

Example:
```ts
const testDir = defineBddConfig({
  tags: '@desktop and not @slow',
  // ...
});
```

## missingSteps
<div style="color: gray; font-size: 0.8em">since <b>v8</b></div>

- **Type:** `'fail-on-gen' | 'fail-on-run' | 'skip-scenario'`
- **Default:** `'fail-on-gen'`

The behavior when missing steps are found:
- `fail-on-gen` *(default)* - test files generation will fail and display code [snippets](writing-steps/snippets.md) for missing steps
- `fail-on-run` - test files will be generated, but tests run will fail
- `skip-scenario` - test files will be generated, but scenarios with missing steps will be marked as `fixme`

## matchKeywords
<div style="color: gray; font-size: 0.8em">since <b>v8</b></div>

- **Type:** `boolean`
- **Default:** `false`

If enabled, the keyword is also taken into account when searching for step definitions. See [Keywords matching](writing-steps/keywords-matching.md).

## verbose

- **Type:** `boolean`
- **Default:** `false`

Verbose output.

## enrichReporterData

!> Since Playwright-BDD **v8**, this option is not used and will be removed in the future.

- **Type:** `boolean`
- **Default:** `undefined`

If this option is enabled, Playwright-BDD will add special attachments with BDD data required for Cucumber reports. It gets enabled automatically when you use the `cucumberReporter()` helper. But for scenarios with [reports merging](reporters/cucumber.md#merge-reports), you need to manually set `enrichReporterData: true` when generating a **blob** report.

## statefulPoms

- **Type:** `boolean`
- **Default:** `false`

Set this option to `true` if you use decorator steps and your Page Object Models have state. This enables more strict guessing of fixtures in scenarios.

**Example**

Imagine you have the following POMs structure:
```
       BasePage
      /        \
TodoPage         TodoPage2
```
And the following scenario:
```gherkin
Scenario: scenario 1
  Given step from BasePage
  When step from TodoPage
  Then step from TodoPage2
```
What POM should we use for the 1st step: `BasePage`, `TodoPage`, or `TodoPage2`?

* If there is no state in POMs (`statefulPoms: false`): we will use `BasePage`
* If there is state in POMs (`statefulPoms: true`): this scenario produces an error because for `TodoPage` / `TodoPage2` it can be important to call previous steps

## importTestFrom

?> Since **v7**, you most likely don't need this option, it is detected automatically from step definitions.

- **Type:** `string`

Path to the file that exports a custom `test` to be used in generated test files.

## paths

!> Deprecated, use [`features`](#features) instead.

- **Type:** `string[]`
- **Default:** `features/**/*.{feature,feature.md}`

Paths to feature files. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features).

## require

!> Deprecated, use [`steps`](#steps) instead.

- **Type:** `string[]`
- **Default:** `features/**/*.(js)`

Paths to step definitions in **CommonJS**. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code).

> Cucumber's option `requireModule: ['ts-node/register']` is not recommended for Playwright-BDD. TypeScript compilation is performed with Playwright's built-in loader.

## import

!> Deprecated, use [`steps`](#steps) instead.

- **Type:** `string[]`
- **Default:** `features/**/*.(js)`

Paths to step definitions in [ESM](configuration/esm.md).