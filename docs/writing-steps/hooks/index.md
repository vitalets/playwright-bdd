# Hooks

Hooks are functions that automatically run before/after workers or scenarios:

* `BeforeWorker / BeforeAll` - runs **once in each worker**, before all scenarios
* `AfterWorker / AfterAll` - runs **once in each worker**, after all scenarios
* `BeforeScenario / Before` - runs **before each scenario**
* `AfterScenario / After` -  runs **after each scenario**
* `BeforeStep` - runs **before each step**
* `AfterStep` -  runs **after each successful step**

> If you need to run some code **before/after overall test execution**, check out Playwright's [project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) or [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown)

Before using hooks, consider [fixtures](writing-steps/hooks/fixtures.md). In most cases, fixtures can fully replace hooks and provide better reuse.

Hook docs:
- [Worker hooks](writing-steps/hooks/worker-hooks.md)
- [Scenario hooks](writing-steps/hooks/scenario-hooks.md)
- [Step hooks](writing-steps/hooks/step-hooks.md)
- [Running hook once](writing-steps/hooks/running-hook-once.md)
