# Options

## features

- **Type:** `string | string[]`
- **Default:** `undefined`

Path(s) to feature files. Can be a directory or [glob pattern](https://github.com/micromatch/picomatch?tab=readme-ov-file#globbing-features).
Example: `features/**/*.feature`.
If you don't specify a file extension, the default is `*.feature`.
Resolved relative to the config file location.

> Since Playwright-BDD **v8**, you can omit the `features` option and define [`featuresRoot`](#featuresroot), which serves as a common base directory for both features and steps. The features glob pattern will be calculated as `{featuresRoot} + /**/*.feature`.

## steps

- **Type:** `string | string[]`
- **Default:** `undefined`

Path(s) to step definitions. Can be a directory or [glob pattern](https://github.com/micromatch/picomatch?tab=readme-ov-file#globbing-features).
Example: `steps/**/*.ts`.
If you don't specify a file extension, the default is `*.{js,mjs,cjs,ts,mts,cts}`.
Resolved relative to the config file location.

> Since Playwright-BDD **v8**, you can omit the `steps` option and define [`featuresRoot`](#featuresroot), which serves as a common base directory for both features and steps. The steps glob pattern will be calculated as `{featuresRoot} + /**/*.{js,mjs,cjs,ts,mts,cts}`.

## outputDir

- **Type:** `string`
- **Default:** `.features-gen`

Directory to output generated test files. Resolved relative to the config file location.

## lockFile

- **Type:** `boolean`
- **Default:** `false`

Coordinates generated test files between `bddgen` processes and active Playwright-BDD workers. A generator waits for other generators and executing BDD workers that use the same output directory. A BDD worker waits if generation has already started.

When using [`bddgen --watch`](cli.md), we recommend setting this option to `true`:

```ts
const testDir = defineBddConfig({
  lockFile: true,
});
```

This prevents watch mode from rewriting generated test files while BDD tests are executing and coordinates it with manual `bddgen` runs. Locks are stored outside the project under the operating system's temporary directory. The generator and Playwright workers must run as the same user and share that temporary filesystem.

If a crashed or unresponsive process leaves locks behind, use [`bddgen clear-locks`](cli.md#bddgen-clear-locks) to remove all locks associated with the current Playwright configuration. This command also removes locks owned by live processes, so do not run it while tests or generation should remain protected.

## watch

- **Type:** `object`
  - `packageRoot` *boolean* - Whether to watch the nearest `package.json` directory. Defaults to `true`.
  - `gitIgnore` *boolean | string* - Apply the package-root `.gitignore`, disable it with `false`, or provide a custom ignore file path. Defaults to `true`.
  - `include` *string[]* - Additional files or directories to watch. Direct files are watched regardless of extension. Defaults to `[]`.
  - `exclude` *string[]* - Files or directories to exclude under any watched root. Defaults to `[]`.
  - `extensions` *string[]* - File extensions that trigger regeneration. Defaults to `['.feature', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx']`.
- **Default:** `undefined`

Options for [`bddgen --watch`](cli.md). Watch mode always observes the exact Playwright config file and the nearest existing directories derived from configured feature and step patterns. It also observes the nearest `package.json` directory by default.

Use `include` for dependencies outside those locations, `exclude` to exclude paths, and `packageRoot: false` to disable the nearest `package.json` directory. Included and excluded paths are resolved relative to the Playwright config location:

```ts
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
  watch: {
    packageRoot: false,
    gitIgnore: '.config/bdd.gitignore',
    include: ['src', '../shared-test-utils', 'data/step-patterns.json'],
    exclude: ['fixtures/large-data', 'src/generated'],
    extensions: ['.feature', '.js', '.ts'],
  },
});
```

By default, the `.gitignore` file in the nearest `package.json` directory is applied. Set
`gitIgnore: false` to disable this behavior, or provide a custom file path resolved relative to the
Playwright config. Patterns in a custom file are relative to that file's directory. The selected
file is watched and changes are applied without restarting watch mode.

The `include` and `exclude` options accept plain filesystem paths, not glob patterns. A directly included file bypasses the extension filter, which allows watching arbitrary inputs such as JSON or YAML files. Files inside an included directory remain subject to `extensions`. Extensions are case-insensitive and may be written with or without a leading dot. Excluding a directory also excludes all its descendants, including configured feature or step directories, and takes precedence over `include`. The `.git` and `node_modules` directories and configured output directories are always excluded and cannot be re-enabled.

## sourceMaps

- **Type:** `boolean`
- **Default:** `false`

Generate external source maps from generated Playwright tests to feature files. Source maps allow
Playwright and editor integrations to display and select tests using feature-file locations.

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

## featuresRoot

- **Type:** `string`
- **Default:** *location of config file*

Base directory to construct generated file paths inside `outputDir`. Resolved relative to the config file location. Note that `featuresRoot` is a directory and cannot contain glob patterns (`*`).

  When playwright-bdd generates a test file for the feature file, it attaches the path to `.features-gen`

  ```
  features/path/to/my-feature.feature
  -->
  .features-gen/features/path/to/my-feature.feature.spec.js
  ```

  If you want to exclude the `features` part from the output, you can set `featuresRoot: 'features'` and then all output paths will be **resolved from it**:
  ```
  featuresRoot='features':
  
  features/path/to/my-feature.feature
  -->
  .features-gen/path/to/my-feature.feature.spec.js
  ```

> The behavior is similar to TypeScript's [rootDir](https://www.typescriptlang.org/tsconfig#rootDir) option, which sets a common parent for all `.ts` files and defines the `outDir` structure.

Since **Playwright-BDD v8**, `featuresRoot` serves as a default directory for both `features` and `steps` if these options are not explicitly defined. This allows for more concise configurations.

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
  features: './features/game/**/*.feature', // <- run only these features
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

## arityCheck

- **Type:** `boolean`
- **Default:** `true`

Validates that each used step definition declares the correct number of function arguments during test generation. The expected count is based on captured step parameters plus a doc string or data table argument. Playwright-style steps also include the first fixtures argument.

You can disable the check globally if your project uses advanced callback signatures that are valid at runtime but cannot be represented by JavaScript `Function.length`, such as rest tuple parameters:

```ts
const testDir = defineBddConfig({
  arityCheck: false,
});
```

You can also override this option for a particular step definition:

```ts
Given(
  /the following (person|animal)s exist:/,
  { arityCheck: false },
  async ({}, ...args) => {
    // ...
  },
);
```

Step-level `arityCheck` inherits the config value by default. Setting it explicitly to `true` or `false` overrides the config value for that step.

## verbose

- **Type:** `boolean`
- **Default:** `false`

Verbose output.

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

## import

!> Deprecated, use [`steps`](#steps) instead.

- **Type:** `string[]`
- **Default:** `features/**/*.(js)`

Paths to step definitions in [ESM](configuration/esm.md).
