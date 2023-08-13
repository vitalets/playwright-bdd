# FAQ

### Is it possible to run BDD tests in a single command? 
This approach was initially implemented: test files were generated directly in `playwright.config.ts` before test execution. It allowed to run tests with `npx playwright test` instead of having two commands as `npx bddgen && npx playwright test`. But later several issues appeared:

1. It became really hard to decide when to generate test files because Playwright config is executed many times from different sources: workers, VS Code extension, UI mode, etc.

2. Implementation of watch mode is tricky. It is impossible to just run `nodemon` with `playwright.config.ts`. Separate command for test generation allows to easily [support watch mode](./recipes.md#watch-mode) 

3. Watching files in `--ui` mode leads to circullar dependency: a change in test files triggers test run which in turn re-imports config and once again triggers a change in test files

For now decoupling **test generation** from **test running** is a better option for integration with Playwright's tooling.

### Is it possible to apply `test.use()` in a generated test file?
Test files generation is a fully automatic process, no manual interceptions allowed.
But instead of applying `test.use` (that has impact to all tests in a file)
you can [utilize tags](./writing-steps.md#using-tags) with custom fixtures.
That is more flexible approach and allows to selectively change settings for a particular scenario/test.

### Why test files pre-generation is needed?
The main reason of pre-generating test files in JavaScript - you get all Playwright tooling out-of-box:

  * you can run particular test with single click in [VS Code extension](./ide-integration.md#vs-code)
  * you can set breakpoint on particular BDD step
  * you can watch changes in test files using `--ui` mode
  * you can do everything you do with regular Playwright tests

Also it provides more transparency on how Playwright **see** your BDD scenarios. If for some reasons you don't want pre-generation - check out [gherkin-wrapper](https://github.com/Niitch/gherkin-wrapper) project, it runs BDD scenarios on-the-fly.