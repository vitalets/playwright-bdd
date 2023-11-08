# FAQ

### Why test files generation is needed?
The main reason of generating Playwright test files from BDD scenarios - you can use all Playwright tooling out-of-box:

  * run single test with [VS Code extension](./ide-integration.md#vs-code)
  * debug and set breakpoint on a particular BDD step
  * use `--ui` mode to watch changes 
  * do whatever you can with regular Playwright tests

Moreover, it provides more transparency on how Playwright **see** your BDD scenarios. If for some reasons you don't want pre-generation - check out [gherkin-wrapper](https://github.com/Niitch/gherkin-wrapper) project, it runs BDD scenarios on-the-fly.

### Is it possible to apply `test.use()` in a generated test file?
Test files generation is a fully automatic process, no manual interceptions allowed.
But instead of applying `test.use` (that has impact to all tests in a file)
you can [utilize tags](./writing-steps.md#using-tags) with custom fixtures.
That is more flexible approach and allows to selectively change settings for a particular scenario/test.

### Is it possible to run BDD tests with a single command? 
This approach was initially implemented: test files were generated during the first execution of `playwright.config.ts`. It allowed to run tests with `npx playwright test` instead of two commands `npx bddgen && npx playwright test`. But later several issues appeared:

1. It became really hard to decide when to generate test files because Playwright config is executed many times from different sources: workers, VS Code extension, UI mode, etc.

2. Implementation of watch mode is tricky. It is impossible to just run `nodemon` with `playwright.config.ts`. Separate command for test generation allows to easily [support watch mode](./recipes.md#watch-mode) 

3. Watching files in `--ui` mode leads to circullar dependency: a change in test files triggers test run which in turn re-imports config and once again triggers a change in test files

For now decoupling **test generation** from **test running** proves to be a better option.

### How to make BDD valuable for my company?
It is very easy to do BDD in a wrong way.

The main point: **create BDD scenarios during calls and discussions with your team**.
Use it as a standard format for clarifying requirements between business analyst, QA and developers. It will save a lot of time for your team to get everybody on the same page instead of endless meetings and email ping-pong.

Don't just write BDD scenarios on your own.

Check out [this article](https://www.serenity-dojo.com/minimal-bdd) for more details.



