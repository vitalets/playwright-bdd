# Multiple step expressions

Playwright-BDD supports multiple expressions for a single step definition. Pass an array of expressions to `Given()`, `When()`, or `Then()` to share one implementation between different step phrasings:

```ts
Given(['I open page {string}', 'I navigate to {string}'], async ({ page }, url: string) => {
  await page.goto(url);
});
```

Both steps below match this definition and call the same implementation:

```gherkin
Given I open page "https://example.com"
Given I navigate to "https://example.com"
```

Each expression should capture the parameters expected by the shared implementation in the same order.

## IDE limitations

Current VS Code extensions for BDD do not support step definitions that use an array of expressions. You cannot navigate to these definitions by clicking a step in a `.feature` file. This limitation affects IDE navigation; Playwright-BDD still matches and runs these steps.
