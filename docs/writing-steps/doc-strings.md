# Using Doc Strings
Playwright-BDD supports [Gherkin "doc strings"](https://cucumber.io/docs/gherkin/reference/#doc-strings); multi-line blocks that follow a step and contain long text content, which may be annotated with a media type.

## Using Content

The content of a doc string is appended as a plain string onto the end of a step definition function's arguments. For example:

```gherkin
Feature: Some feature

  Scenario: Use multi-line doc string
    When Fill "textarea" with:
      """
      This is an example of a doc string.

      Doc strings can span multiple lines, and all spacing preceding each line that also precedes the block is removed.
      """
```

Step definition:

```ts
import { createBdd } from 'playwright-bdd';

const { When } = createBdd();

When('Fill {string} with:', async ({ page }, selector: string, docString: string) => {
  await page.fill(selector, docString);
});
```

## Using Media Types

A doc string may be annotated with a media type by specifying it immediately after the start of its block. Media types are exposed (if set) via the `docStringType` property of the `$step` fixture. For example:

```gherkin
Feature: Another feature

  Scenario: Use JSON doc string
    When Fill page with:
      """json
      {
        "username": "vitalets",
        "password": "12345"
      }
      """
```

Playwright-BDD does not parse the content of a doc string based on its media type, this behaviour is left to the step definition:

```ts
import { createBdd } from 'playwright-bdd';

const { When } = createBdd();

When('Fill page with:', async ({ page, $step }, docString: string) => {
  if ($step.docStringType !== 'json') {
    throw new Error('Doc string does not have JSON media type');
  }
  const data = JSON.parse(docString);
  expect(data.username).toBe('vitalets');
});
```

> Doc string media types are not exposed in Playwright-BDD 8.5.0 and before.
