---
name: playwright-bdd
description: Creates and maintains Gherkin feature files and step definitions for Behavior-Driven Development (BDD) with Playwright. Use when creating or editing .feature files and writing BDD steps for a playwright-bdd project.
---

# playwright-bdd

Workflow for creating and maintaining [playwright-bdd](https://github.com/vitalets/playwright-bdd) feature files and step definitions.

## Steps

### 1. Get familiar with the CLI

Run the following to see all available commands and options:

```bash
npx bddgen --help
```

### 2. Discover project configuration

Search `playwright.config.ts` (or `playwright.config.js`) for `defineBddConfig(...)` calls. This reveals the actual directory where `.feature` files live and `steps` (glob patterns pointing to step definition files).

- If the user has explicitly provided a features directory, use it directly.
- If multiple `defineBddConfig` calls exist, guess the most suitable one based on the feature description (e.g. match directory names or tags to the described feature area). Only ask the user to clarify if it is genuinely ambiguous.

### 3. Discover available steps

Run `npx bddgen export` to list all registered step definitions:

```bash
npx bddgen export
# If the config file is not at the project root:
npx bddgen export --config <path-to-config>
```

The output lists steps in the format:

```
* Given <pattern>
* When <pattern>
* Then <pattern>
```

Parse these lines and use the patterns as-is when writing feature steps. Do NOT invent new step text if a matching pattern already exists.

### 4. Write the feature file

Place the file inside features directory discovered in step 2. Prefer existing step patterns; flag any behaviors that cannot be covered and proceed to step 5.

**Practical tips:**

- **Scenario Outline + Examples** — when the same flow should run with multiple data sets, use `Scenario Outline` with an `Examples:` table instead of duplicating scenarios.
- **Background** — if two or more scenarios share identical `Given` steps, extract those into a `Background:` block.
- **Tags** — add tags (`@smoke`, `@regression`, `@jira:123`) to support filtering via `npx bddgen --tags "@smoke and not @slow"`. Match existing tag conventions visible in project `.feature` files.
- **Cucumber expression parameters** — `{string}` values must be written in `"double quotes"`, `{int}` is a bare integer, `{float}` is a bare decimal. Never modify the keyword pattern text itself.
- **Doc strings** — pass multi-line values (e.g. JSON, SQL) as triple-quoted doc strings directly below the step line:
  ```
  Given the following payload:
    """
    { "key": "value" }
    """
  ```
- **Data tables** — pass tabular data using pipe-separated tables directly below the step line:
  ```
  Given the following users:
    | name  | role  |
    | Alice | admin |
  ```

### 5. Propose missing step implementations

When a behavior cannot be covered by existing steps:

1. Resolve the `steps` glob from `defineBddConfig` and read the actual step files.
2. Identify the project's step style:
   - **Playwright-style**: `Given('pattern', async ({ page, ... }, arg) => { ... })`
   - **Cucumber-style**: `Given('pattern', async function(arg) { this.page... })`
   - **Decorators**: `@Given('pattern') async methodName(arg) { ... }` inside a POM class
3. Propose complete step implementations in the same style as the existing files.
4. Suggest the most appropriate file to add them to, inferred from the existing file naming (e.g. add auth-related steps to `steps/auth.steps.ts` if that file exists).

## Further Reading

For deeper detail on any topic — configuration, step styles, fixtures, hooks, reporters — fetch the official documentation: https://vitalets.github.io/playwright-bdd/#/
