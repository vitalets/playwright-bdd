# CLI
Command line `bddgen`.

## `bddgen test` (or just `bddgen`)
Generates Playwright test files from Gherkin documents (`.feature` files).
This command is typically followed by `npx playwright test` to run generated tests. 
It also assumes that there is `playwright.config.(ts|js)` with one or several calls of [`defineBddConfig()`](configuration/index.md).

Examples:

* Generate and run test files using `playwright.config.ts` in default location (working dir):
    ```
    npx bddgen && npx playwright test
    ```
    
* Use `--tags` option to generate test with [filtering by tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
    ```
    npx bddgen --tags "@foo and not @bar" && npx playwright test
    ```

* Use `-c` / `--config` option to set custom config. Note: the same config should be provided to both `bddgen` and `playwright test` commands:
    ```
    npx bddgen -c path/to/playwright.config.ts && npx playwright test -c path/to/playwright.config.ts
    ```

* Use `-h` to show help:
    ```
    npx bddgen test -h
    # or to show global help
    npx bddgen -h
    ```

## `bddgen export`
Prints list of all found step definitions. 
Useful for [generating BDD scenarios with ChatGPT](writing-features/chatgpt.md).
```
$ npx bddgen export
```
Example output:
```
Using config: playwright.config.ts
List of all steps (4):

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```
#### Options
* `--config` - path to Playwright config
* `--unused-steps` - output only unused steps

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
