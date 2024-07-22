# FAQ

### Why test files generation is needed?
The main reason of generating Playwright test files from BDD scenarios - you can use all Playwright tooling out-of-box:

  * run single test with [VS Code extension](guides/ide-integration.md#vs-code)
  * debug and set breakpoint on a particular BDD step
  * use `--ui` mode to watch changes 
  * do whatever you can with regular Playwright tests

Moreover, it provides more transparency on how Playwright **see** your BDD scenarios. If for some reasons you don't want pre-generation - check out [gherkin-wrapper](https://github.com/Niitch/gherkin-wrapper) project, it runs BDD scenarios on-the-fly.

### Is it possible to apply `test.use()` in a generated test file?
Test file generation is a fully automated process with no manual intervention required. Instead of using test.use, which affects all tests in a file, you can [utilize tags](writing-steps/playwright-style.md#tags) with custom fixtures. This approach is more flexible and allows for selectively changing settings for specific scenarios or tests.

### Is it possible to run BDD tests with a single command? 
This approach was initially implemented: test files were generated during the first execution of `playwright.config.ts`. It allowed to run tests with `npx playwright test` instead of two commands `npx bddgen && npx playwright test`. But later several issues appeared:

1. It became really hard to decide when to generate test files because Playwright config is executed many times from different sources: workers, VS Code extension, UI mode, etc.

2. Implementation of watch mode is tricky. It is impossible to just run `nodemon` with `playwright.config.ts`. Separate command for test generation allows to easily [support watch mode](guides/watch-mode.md) 

3. Watching files in `--ui` mode leads to circular dependency: a change in test files triggers test run which in turn re-imports config and once again triggers a change in test files

For now decoupling **test generation** from **test running** proves to be a better option.

### How to make BDD valuable for my project?
The main point - **BDD is a collaboration technique**.

Write BDD scenarios together with your team during calls and discussions. Use it as a strict format to clarify requirements between business, QA and developers. It should help you to get everybody on the same page instead of going back and forth on endless meetings.

Don't just write BDD scenarios on your own. It's like having a corporate messenger used by a single employee.

For more information check out [this post](https://news.ycombinator.com/item?id=10194242) of Cucumber creator and [Real-World BDD article](https://www.serenity-dojo.com/minimal-bdd).



