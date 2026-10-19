# Test locks

When scenarios access a shared resource that cannot safely be used concurrently, use [Playwright test locks](https://playwright.dev/docs/test-parallel#test-locks) by declaring a `lock` on the relevant step definitions:

```ts
const { Given } = createBdd();

Given('a new user', { lock: 'users-service' }, async ({ request }) => {
  await request.post('/users');
});

Given('the shared data is reset', { lock: ['database', 'users-service'] }, async ({ request }) => {
  await request.post('/reset');
});
```

Every scenario matching these definitions inherits their locks. During generation, Playwright-BDD combines names from all matched steps, including Feature and Rule Backgrounds, removes duplicates, and adds the resulting array to the generated Playwright test:

```ts
test('Create an account', { lock: ['users-service', 'database'] }, async ({ Given }) => {
  // Generated steps
});
```

Locks work with Playwright-style steps, Cucumber-style steps, and step decorators. For decorators, pass the same option to `@Given`, `@When`, `@Then`, or `@Step`:

```ts
@Given('a new user', { lock: 'users-service' })
async createUser() {
  await this.request.post('/users');
}
```

## Scheduling and compatibility

Locks are declared on step definitions but apply to whole tests. Playwright controls acquisition and release: tests sharing a lock name cannot run concurrently across files, workers, and projects within the same test run. In default and serial modes, Playwright can hold a lock for the duration of the whole file.

Test locks require **Playwright 1.63 or later**. On older versions, generation fails with an upgrade message only when a generated test needs locks. Scenarios without locks continue to work on the package's supported Playwright versions.

Scenarios skipped during generation, including `@skip`, `@fixme`, and `missingSteps: 'skip-scenario'`, omit locks. A potential runtime skip does not remove locks, because scheduling happens before the skip condition is evaluated.

## Matching and reusable steps

Lock names are static strings or arrays of strings. Each Scenario Outline example receives the locks from its matched definitions. Scoped definitions and aliases follow the existing matching rules; unrelated definitions do not contribute locks.

Calling a reusable step function inside another step does not propagate its locks. Declare the necessary locks explicitly on the outer matched step:

```ts
const createUser = Given('a new user', { lock: 'users-service' }, async ({ request }) => {
  await request.post('/users');
});

Given('an initialized account', { lock: 'users-service' }, async ({ request }) => {
  await createUser({ request });
});
```

An empty lock array adds no locks. Gherkin lock tags and parameter-derived lock names are not supported.
