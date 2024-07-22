# Cucumber-style steps (legacy)

!> This approach is **legacy** and will be removed in the future versions of `playwright-bdd`. Please check-out [new cucumber-style](writing-steps/cucumber-style.md).

Cucumber-style step definitions are compatible with CucumberJS:

* import `Given`, `When`, `Then` directly from `@cucumber/cucumber` package
* [use regular functions for steps](https://github.com/cucumber/cucumber-js/blob/main/docs/faq.md#the-world-instance-isnt-available-in-my-hooks-or-step-definitions) (not arrow functions!) 
* use `this` to access Playwright API 

Example (TypeScript):

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';
import { expect } from '@playwright/test';

Given<BddWorld>('I open url {string}', async function (url: string) {
  await this.page.goto(url);
});

When<BddWorld>('I click link {string}', async function (name: string) {
  await this.page.getByRole('link', { name }).click();
});

Then<BddWorld>('I see in title {string}', async function (keyword: string) {
  await expect(this.page).toHaveTitle(new RegExp(keyword));
});
```

## World
Playwright-bdd provides `BddWorld` extending [Cucumber World](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md) with Playwright [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) and [testInfo](https://playwright.dev/docs/test-advanced#testinfo-object). Simply use `this.page` or `this.testInfo` in step definitions:

```js
import { Given, When, Then } from '@cucumber/cucumber';

Given('I open url {string}', async function (url) {
  console.log(this.testInfo.title);
  await this.page.goto(url);
});
```

In TypeScript you should import `BddWorld` type from `playwright-bdd` for proper typing:
```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

Given<BddWorld>('I open url {string}', async function (url: string) {
  await this.page.goto(url);
});
```

Check out [all available props of BddWorld](https://github.com/vitalets/playwright-bdd/blob/main/src/run/bddWorld.ts). 

## Custom World
To use Custom World you should inherit it from `BddWorld` and pass to Cucumber's `setWorldConstructor`:

```ts
import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld, BddWorldOptions } from 'playwright-bdd';

export class CustomWorld extends BddWorld {
  myBaseUrl: string;
  constructor(options: BddWorldOptions) {
    super(options);
    this.myBaseUrl = 'https://playwright.dev';
  }

  async init() {
    await this.page.goto(this.myBaseUrl);
  }
}

setWorldConstructor(CustomWorld);
```
> Consider asynchronous setup and teardown of `BddWorld` using `init()` / `destroy()` methods.

See [full example of Cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

## Custom fixtures
Along with Playwright built-in fixtures, you can use any custom fixture in cucumber-style steps.
To get a fixture, use method `this.useFixture(fixtureName)` inside step body.

For example:
```js
When('I open todo page', async function () {
  const todoPage = this.useFixture('todoPage');
  await todoPage.open();
});
```

For **TypeScript** you can pass `typeof test` as a second generic parameter to `BddWorld`
to get proper typing:

```ts
type MyWorld = BddWorld<object, typeof test>;

When<MyWorld>('I open todo page', async function () {
  const todoPage = this.useFixture('todoPage');
  await todoPage.open();
});
```

> Please note that **you can only pass static strings** to `this.useFixture()`. Function body is analyzed to find used fixtures. Below **will not work**:
```ts
// will not work!
const fixtureName = 'todoPage';
const todoPage = this.useFixture(fixtureName);
```
