# Customize examples title
By default each examples row from `Scenario Outline` is converted into test with title `Example #{index}`.
It can be not reliable for reporters that keep track of test history, because on every insertion / deletion of rows test titles will shift.

There are 3 ways to set consistent title for examples.

#### 1. Use scenario name as a template
You can add column names like `<column>` to the scenario name. In that case scenario name will be used as a title template for generated examples. E.g.:
```gherkin
Feature: Localization

    Scenario Outline: Check title for <locale>
      Given user locale is "<locale>"
      Then page title is "<title>"

      Examples:
          | locale | title      |
          | en     | Playwright |
          | es     | Dramaturgo |
```

Generated test file:
```js
test.describe(`Localization`, () => {

  test.describe(`Check title for <locale>`, () => {

    test(`Check title for en`, async ({ Given, Then }) => {
      await Given(`user locale is "en"`);
      await Then(`page title is "Playwright"`);
    });

    test(`Check title for es`, async ({ Given, Then }) => {
      await Given(`user locale is "es"`);
      await Then(`page title is "Dramaturgo"`);
    });
```

#### 2. Use special comment syntax
You can provide own fixed title format by adding a special comment right above `Examples`. 
The comment should start with `# title-format:` and can reference column names as `<column>`. For example:
```gherkin
Feature: Localization

    Scenario Outline: Check title
      Given user locale is "<locale>"
      Then page title is "<title>"

      # title-format: locale - <locale>
      Examples:
          | locale | title      |
          | en     | Playwright |
          | es     | Dramaturgo |
```

Generated test file:
```js
test.describe(`Localization`, () => {

  test.describe(`Check title`, () => {

    test(`locale - en`, async ({ Given, Then }) => {
      await Given(`user locale is "en"`);
      await Then(`page title is "Playwright"`);
    });

    test(`locale - es`, async ({ Given, Then }) => {
      await Given(`user locale is "es"`);
      await Then(`page title is "Dramaturgo"`);
    });
```

#### 3. Use config option
You can set config option [examplesTitleFormat](configuration/options.md#examplestitleformat) to define global template for examples title.
