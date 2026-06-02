# Migration to v9

Playwright-BDD **v9** upgrades the Cucumber ecosystem to the latest versions and removes several previously deprecated APIs. Most users will only need to update their Node.js version and remove one deprecated option.

## Required actions

### Upgrade Node.js to 20+

The minimum supported Node.js version has been raised from 18 to 20.

Check your version:
```
node --version
```

If you're below 20, upgrade Node.js before continuing.

### Remove `enrichReporterData` option

The `enrichReporterData` config option has been removed. It was deprecated in v7 and no longer has any effect. Simply delete it from your `playwright.config.ts`:

```ts
// Before
const testDir = defineBddConfig({
  enrichReporterData: true, // remove this line
  features: '...',
  steps: '...',
});

// After
const testDir = defineBddConfig({
  features: '...',
  steps: '...',
});
```

## Behavior changes

### JUnit reporter: new default test case naming

The JUnit reporter now uses Cucumber-compatible test case naming by default ([#375](https://github.com/vitalets/playwright-bdd/issues/375)). Previously the default was a Playwright-style name (feature › rule › scenario).

If you rely on specific JUnit test case names in your CI pipeline (e.g. for test tracking or filtering), review the generated output. To restore the previous Playwright-style naming, set `nameFormat: 'playwright'` explicitly:

```ts
cucumberReporter('junit', {
  outputFile: 'cucumber-report/report.xml',
  nameFormat: 'playwright', // restores old default
})
```

### JSON reporter: attachments skipped by default

The Cucumber JSON reporter now skips attachments (screenshots, videos, traces) by default (`skipAttachments: true`) to avoid oversized report files. Previously, attachments were included by default.

If your workflow depends on attachments in the JSON output, opt back in explicitly:

```ts
cucumberReporter('json', {
  outputFile: 'cucumber-report/report.json',
  skipAttachments: false, // include attachments
})
```

### Stricter step definition arity validation

Playwright-BDD now validates that step definition functions declare the correct number of arguments, matching Cucumber's rules. Steps with a mismatched argument count will fail at test generation time with an error.

If you see a new arity-related error after upgrading, update the step function signature to match the number of captured groups plus any doc string or data table argument:

```ts
// Step pattern captures one group — function must accept one arg (+ fixtures for Playwright-style)
Given('I have {int} items', ({ page }, count: number) => { ... });

// Step with a data table — add extra arg for the table
Given('I have the following items:', ({ page }, table: DataTable) => { ... });
```

## Non-breaking changes

### `junit-modern` reporter deprecated

The `junit-modern` reporter name is now deprecated in favor of `junit`. Both names produce identical output and `junit-modern` remains functional as a compatibility alias, but you should rename it to avoid future warnings:

```ts
// Before
cucumberReporter('junit-modern', { outputFile: '...' })

// After
cucumberReporter('junit', { outputFile: '...' })
```

### Cucumber ecosystem packages upgraded

Internal Cucumber dependencies have been upgraded to their latest major versions:

| Package | v8 | v9 |
|---|---|---|
| `@cucumber/messages` | 27.x | 32.x |
| `@cucumber/gherkin` | 32.x | 39.x |
| `@cucumber/cucumber-expressions` | 18.x | 19.x |
| `@cucumber/tag-expressions` | 6.x | 9.x |

This is transparent for most users. If you consume `@cucumber/messages` types directly (e.g. in custom reporters or message-file processing), re-check for any API changes in the respective package changelogs.

### `$step` fixture: `docStringType` added

The `$step` BDD fixture now exposes the doc string media type as `docStringType` ([#380](https://github.com/vitalets/playwright-bdd/issues/380)). This lets step definitions branch on the declared media type of a doc string. No action required — see [Doc strings: Using Media Types](writing-steps/doc-strings.md#using-media-types) for usage examples.

---

## Thank you

A big thank you to everyone who reported issues, submitted pull requests, and provided feedback that shaped this release. Your contributions make playwright-bdd better for everyone.

If you run into any problems while migrating, please [open an issue](https://github.com/vitalets/playwright-bdd/issues) — we're happy to help.
