# Writing Hooks

Hooks are functions that automatically run before/after workers or scenarios:

* `BeforeWorker / BeforeAll` - runs **once in each worker**, before all scenarios
* `AfterWorker / AfterAll` - runs **once in each worker**, after all scenarios
* `BeforeScenario / Before` - runs **before each scenario**
* `AfterScenario / After` -  runs **after each scenario**
* `BeforeStep` - runs **before each step**
* `AfterStep` -  runs **after each invoked step**

> If you need to run some code **before/after overall test execution**, check out Playwright's [project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) or [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown)

Before using hooks, consider [fixtures](writing-hooks/fixtures.md). In most cases, fixtures can fully replace hooks and provide better reuse.

