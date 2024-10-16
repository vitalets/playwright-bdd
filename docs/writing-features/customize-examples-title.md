# Customize examples title
By default each examples row from `Scenario Outline` is converted into test with title `Example #{index}`.
It can be not reliable for reporters that keep track of test history, because on every insertion / deletion of rows test titles will shift.

There are 3 ways to set consistent title for examples.

#### 1. Use scenario name as a template
You can add column names like `<column>` to the scenario name. In that case scenario name will be used as a title template for generated examples.

!> Note that generated titles should be **unique** within scenario, otherwise Playwright will throw an error.

Example:
```gherkin
Feature: Calculator

    Scenario Outline: Multiply <value> by two
      Given value is <value>
      When multiply by two
      Then result is <result>

      Examples:
        | value | result |
        | 1     | 2      |
        | 2     | 4      |
```

Generated test file:
```js
test.describe(`Calculator`, () => {

  test.describe(`Multiply <value> by two`, () => {

    test(`Multiply 1 by two`, async ({ Given, When, Then }) => {
      await Given(`value is 1`);
      await When(`multiply by two`);
      await Then(`result is 2`);
    });

    test(`Multiply 2 by two`, async ({ Given, When, Then }) => {
      await Given(`value is 2`);
      await When(`multiply by two`);
      await Then(`result is 4`);
    });

  });
});    
```

#### 2. Use special comment syntax
You can provide own fixed title format by adding a special comment right above `Examples`. 
The comment should start with `# title-format:` and can reference column names as `<column>`. For example:
```gherkin
Feature: Calculator

    Scenario Outline: Multiply by two
      Given value is <value>
      When multiply by two
      Then result is <result>

      # title-format: check <value>
      Examples:
        | value | result |
        | 1     | 2      |
        | 2     | 4      |
```

Generated test file:
```js
test.describe(`Calculator`, () => {

  test.describe(`Multiply by two`, () => {

    test(`check 1`, async ({ Given, When, Then }) => {
      await Given(`value is 1`);
      await When(`multiply by two`);
      await Then(`result is 2`);
    });

    test(`check 2`, async ({ Given, When, Then }) => {
      await Given(`value is 2`);
      await When(`multiply by two`);
      await Then(`result is 4`);
    });

  });
});
```

#### 3. Use config option
You can set config option [examplesTitleFormat](configuration/options.md#examplestitleformat) to define global template for examples title.
