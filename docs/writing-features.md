# Writing features
Write features in `*.feature` files using [Gherkin syntax](https://cucumber.io/docs/gherkin/reference/#keywords). All keywords are supported.

Example:

```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

## Tagging
[Cucumber tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tags) are fully supported. For example:
```gherkin
@desktop
Feature: Playwright site

    @slow
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

After adding tags to your scenarios you can generate and run subset of tests using `--tags` option with [tags expression](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
```
npx bddgen --tags "@desktop and not @slow" && npx playwright test
```
Also you can [access tags inside step definitions](#using-tags).

## Run single feature
Use `@only` tag to run a single feature / scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## Skip feature
Use `@skip` (or `@fixme`) tag to skip a particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## Customize examples title
By default each row from `Scenario Outline` examples is converted into test with title `Example #{index}`.
It can be not reliable for reporters that keep track of test history, because on every insertion / deletion of rows
test titles will shift.

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
