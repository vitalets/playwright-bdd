# Customize examples title
By default, each example row from a `Scenario Outline` is converted into a test with the title `Example #{index}`.
This can be unreliable for reporters that keep track of test history because, with every insertion or deletion of rows, test titles will shift.

There are four ways to set a consistent title for examples.

#### 1. Use scenario name as a template
You can add column names like `<column>` to the scenario name. In that case, the scenario name will be used as a title template for generated examples.

!> Note that generated titles should be **unique** within a scenario; otherwise, Playwright will throw an error.

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

#### 2. Use Examples name as a template
You can add a name after the `Examples:` keyword. If the name references at least one column as `<column>`, it will be used as the title template for every test generated from that Examples block.
This takes priority over a template in the scenario name and allows each Examples block to have its own title format.

Example:
```gherkin
Feature: Calculator

    Scenario Outline: Multiply by two
      Given value is <value>
      When multiply by two
      Then result is <result>

      Examples: positive value <value>
        | value | result |
        | 1     | 2      |
        | 2     | 4      |

      Examples: negative value <value>
        | value | result |
        | -1    | -2     |
        | -2    | -4     |
```

Generated test titles:
```js
test(`positive value 1`, async ({ Given, When, Then }) => { /* ... */ });
test(`positive value 2`, async ({ Given, When, Then }) => { /* ... */ });
test(`negative value -1`, async ({ Given, When, Then }) => { /* ... */ });
test(`negative value -2`, async ({ Given, When, Then }) => { /* ... */ });
```

?> In Cucumber reports, the `Examples:` name is block-level metadata and is displayed without substituting values for a particular row. The generated Playwright test titles are substituted because each row produces a separate test.

#### 3. Use special comment syntax
You can provide your own fixed title format by adding a special comment right above `Examples`. 
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

#### 4. Use config option
You can set the config option [examplesTitleFormat](configuration/options.md#examplestitleformat) to define a global template for examples titles.
