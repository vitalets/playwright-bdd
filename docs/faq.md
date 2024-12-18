# FAQ

### Why is test files generation needed?
Generating Playwright test files from BDD scenarios allows you to use all Playwright tooling out-of-box:

  * Run a single test with [VS Code extension](guides/ide-integration.md#vs-code)
  * Debug and set breakpoints on specific BDD steps
  * Use `--ui` mode to watch changes 
  * Do everything you can with regular Playwright tests

Moreover, it provides more transparency on how Playwright **sees** your BDD scenarios.

Initially, Playwright-BDD tried to run BDD tests on-the-fly, within `npx playwright test` command. However, several issues appeared:

1. Too many re-generation, because the Playwright config is executed many times from different sources: workers, VS Code extension, UI mode, etc.
2. Implementing watch mode is tricky.
3. Watching files in `--ui` mode leads to a circular dependency: a change in test files triggers a test run, which re-imports the config and triggers another change in test files.

For now, decoupling **test generation** from **test execution** proves to be a better option.

### Can I manually apply `test.use()` in a generated file?
No. Test files generation is fully automated without manual edits. Instead of using `test.use`, which affects all tests in a file, you can [utilize tags](writing-steps/bdd-fixtures.md#tags) and custom fixtures. This approach is more flexible and allows for selectively changing settings for specific scenarios or tests.

### How can I make BDD valuable for my project?
The main point — **BDD is a collaboration technique**.

Write BDD examples together with your team during calls and discussions. Use it as a framework to clarify requirements between business, QA, and developers. It should help you get everybody on the same page instead of going back and forth in endless meetings.

For more information, check out [this post](https://news.ycombinator.com/item?id=10194242) by the Cucumber creator and the [Real-World BDD article](https://www.serenity-dojo.com/minimal-bdd).



