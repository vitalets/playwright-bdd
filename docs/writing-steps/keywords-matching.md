# Keywords matching

By default, keywords [don't matter](https://cucumber.io/docs/gherkin/reference/#steps) when searching for step definition. 

For example, the following step with `Given`:
```gherkin
Given a step
```
successfully matches definition with `When`:
```js
When('a step', () => { ... });
```

In some cases, you may want to restrict such behavior and require keywords matching additionally to step text. Since playwright-bdd v8 you can enable that with [`matchKeywords`](configuration/options.md#matchkeywords) option:

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  // ...
  matchKeywords: true,
});

export default defineConfig({
  testDir,
});
```
Now, if you run code from the previous example, you will get missing step definition error:
```
Missing step definitions: 1

Given('a step', async ({}) => {
  // Step: Given a step
  // From: features/homepage.feature:4:5
});

Use snippets above to create missing steps.
```

#### Rules of `matchKeywords: true`
1. if scenario step starts with `Given`, `When`, `Then` → it matches only definitions with the corresponding keyword or universal `Step` function.
2. if scenario step starts with `And` / `But` → it looks up to the nearest full keyword (`Given, When, Then`) and follows the rule 1. If it is the first step of the scenario, it is treated as `Given`.
3. if scenario step starts with `*` → it matches any keyword.
