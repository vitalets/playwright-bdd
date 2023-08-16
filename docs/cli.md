# CLI
Command line `bddgen`.

## `bddgen test` (or just `bddgen`)
Generates Playwright test files from Gherkin documents (`.feature` files).
This command is typically followed by `npx playwright test` to run generated tests. 
It also assumes that there is `playwright.config.(ts|js)` with one or several calls of [`defineBddConfig()`](configuration.md#definebddconfigconfig).

Examples:

* Generate and run test files using `playwright.config.ts` in default location (working dir):
    ```
    npx bddgen && npx playwright test
    ```
    
* Generate and run test files with [filtering by tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
    ```
    npx bddgen --tags "@foo and not @bar" && npx playwright test
    ```

* Generate and run test files using **custom** `playwright.config.ts`. The same config should be provided to both `bddgen` and `playwright test`):
    ```
    npx bddgen -c path/to/playwright.config.ts && npx playwright test -c path/to/playwright.config.ts
    ```

* Show help:
    ```
    npx bddgen test -h
    # or to show global help
    npx bddgen -h
    ```

## `bddgen export`
Prints list of all found step definitions. 
Useful for building AI prompt to generate BDD scenarios.
```
$ npx bddgen export
```
Example output:
```
List of all steps found by config: playwright.config.ts

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```
<details>
  <summary>Example prompt for ChatGPT</summary>

  ```
  Generate BDD scenarios for the following feature:

  Todo app that allows to add and remove todo items. 

  Format output as a single gherkin file. 
  Use Background for common steps.
  Use "And" keyword for repeated "Given" / "When" / "Then".
  Strictly use only the following step definitions:

  * Given I am on todo page
  * When I add todo {string}
  * When I remove todo {string}
  * Then visible todos count is {int}
  ```
</details>

## `bddgen env`
Displays info about current environment:
```
$ npx bddgen env
```
Example output:
```
Playwright-bdd environment info:

platform: darwin
node: v18.16.0
playwright-bdd: v5.1.1
@playwright/test: v1.36.2
@cucumber/cucumber: v9.2.0
```
