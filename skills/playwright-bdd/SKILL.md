---
name: playwright-bdd
description: 'Enforces Behavior Driven Development. Use when: implementing new features, making significant code changes, adding functionality, refactoring behavior. Requires writing a Gherkin feature file first, getting user approval, then implementing.'
---

# Playwright BDD

## Phase 0: BDD Necessity Check

Before writing or modifying any feature files, **ask the user** whether a BDD spec is required for this change and wait for confirmation. If the user says no, skip the BDD workflow entirely.

## Phase 1: Planning

1. **Discover project configuration** — Search `playwright.config.ts` (or `playwright.config.js`) for `defineBddConfig(...)` calls. This reveals the features directory and the `steps` glob patterns pointing to step definition files.
   - If multiple `defineBddConfig` calls exist, pick the most suitable one based on context (e.g. match directory names to the described feature area). Only ask the user to clarify if it is genuinely ambiguous.
2. **Discover available steps** — Run `npx bddgen export` to list all registered step definitions:
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
   Use these patterns as-is when composing scenarios. Do NOT invent new step text if a matching pattern already exists.
3. **Convert raw input into BDD scenarios** — Check the existing feature files and create or update BDD scenarios according to the input. Follow the [gherkin rules](gherkin-rules.md) to ensure scenarios focus on end-to-end user-facing behavior with a meaningful outcome. If there is no end-to-end behavior to verify, omit BDD workflow.
4. **Present scenarios for approval** — Show new or changed scenarios to the user for negotiation. Do not proceed to implementation until the user confirms the scenarios are correct.
   - If the user requests changes, update the feature file and re-present.
   - Iterate until the user explicitly approves.

## Phase 2: Implementation

1. **Implement the feature** — Write the actual feature implementation code, follow project guidelines, not this skill.
2. **Implement step definitions** — Write or update step definitions for the steps used in the scenarios. First resolve the `steps` glob from `defineBddConfig` and read the actual step files to identify the project's step style, then match it:
   - **Playwright-style**: `Given('pattern', async ({ page, ... }, arg) => { ... })`
   - **Cucumber-style**: `Given('pattern', async function(arg) { this.page... })`
   - **Decorators**: `@Given('pattern') async methodName(arg) { ... }` inside a POM class

   Suggest the most appropriate file to add new steps to, inferred from existing file naming (e.g. add auth-related steps to `steps/auth.steps.ts` if that file exists).

## Phase 3: Verification

Execute `npx bddgen && npx playwright test` to generate test files from features and run them with Playwright.

Run only the relevant subset of tests by passing the paths of generated spec files to the Playwright CLI. The generated directory is defined by `defineBddConfig()` in `playwright.config.ts` (the `testDir` value).

Example:

```shell
npx bddgen && npx playwright test .features-gen/@homepage/homepage.feature.spec.js
```

## Gherkin Rules

See [gherkin-rules.md](gherkin-rules.md) for feature file guidelines.

## Scoped Step Definitions

Prefer `@`-prefixed directories to scope step definitions to specific feature domains. This avoids conflicts when common step names (e.g. `I should see {string} text`) need different implementations depending on context.
More details on scoped steps: https://vitalets.github.io/playwright-bdd/#/writing-steps/scoped?id=tags-from-path

**Example Directory Structure with Scoping**

```
features/
├── fixtures.ts
├── @homepage/
│   ├── homepage.feature
│   └── steps.ts
├── @profile/
│   ├── profile.feature
│   └── steps.ts
└── shared-steps.ts
```

Steps defined inside `features/@homepage/steps.ts` are automatically scoped to features in the same directory — no explicit `{ tags: '@homepage' }` needed.

## Example Feature File

```gherkin
Feature: Shopping cart

  Scenario: Add item to cart
    Given I am on a product page
    When I add the product "banana" to the cart
    Then the cart badge shows 1
    And the cart contains "banana"
```

## Example Step Definitions

```typescript
import { Given, When, Then } from './fixtures';

Given('I am on a product page', async ({ page }) => {
  await page.goto('/product');
});

When('I add the product {string} to the cart', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Add ${name}` }).click();
});

Then('the cart badge should show {int}', async ({ page }, count: number) => {
  await expect(page.locator('.cart-badge')).toHaveText(String(count));
});
```
