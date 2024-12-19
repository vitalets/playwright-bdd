# Keywords matching

By default, a keyword of the step definition (e.g. `Given` vs `When` vs `Then`) [is not considered](https://cucumber.io/docs/gherkin/reference/#steps) when matching with scenario steps. 

For example, the following definition with `Given`:
```js
Given('a step', () => { ... });
```
successfully matches any of these steps:
```gherkin
Given a step
When a step
Then a step
```

In some cases, you may want to restrict such behavior and require keywords matching in addition to the step pattern. Since **Playwright-BDD v8**, you can enable that with the [`matchKeywords`](configuration/options.md#matchkeywords) option:

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  matchKeywords: true,
  // ...
});

export default defineConfig({
  testDir,
});
```

Now, if you run the code from the previous example, you will get a missing step definition error:
```
Missing step definitions: 1

When('a step', async ({}) => {
  // Step: When a step
  // From: features/homepage.feature:4:5
});

Use snippets above to create missing steps.
```

#### Rules of `matchKeywords: true`
1. If a scenario step starts with `Given`, `When`, `Then` → it matches only definitions with the corresponding keyword or the universal `Step` function.
2. If a scenario step starts with `And` / `But` → it looks up to the nearest full keyword (`Given, When, Then`) and follows rule 1. If it is the first step of the scenario, it is treated as `Given`.
3. If a scenario step starts with `*` → it matches any keyword.
