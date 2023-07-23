import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';`,
    `// 1. Missing step definition for "sample.feature:5:7"`,
    `@When('I add todo {string}')`,
    `// 2. Missing step definition for "sample.feature:7:7"`,
    `@Then('visible todos count is {int}')`,
    `Missing step definitions (2)`,
  ]),
);
