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
2. **Write BDD scenarios** — Check the existing feature files and create or update BDD scenarios according to the input. Strictly follow the "Scenario Writing Rules" section.
3. **Present feature-file changes for approval before any implementation plan** — Show the exact new or changed Gherkin content to the user for negotiation:
   - When presenting changes to existing scenarios, use unified diff format (```diff) to clearly show additions and removals. For entirely new scenarios, show them in plain Gherkin format.
   - Always show the target feature file path, so it's clear where the scenario will be added or modified.
   - If the user asks for a plan, do not finalize the plan until these feature-file changes have been shown and explicitly approved.
   - Do not substitute a summary, checklist, or implementation plan for the feature-file diff/Gherkin. The user must see the proposed `.feature` file update itself.
   - If the user requests changes, revise the proposed scenario text and re-present it.
   - Iterate until the user explicitly approves the scenarios. Do not proceed to implementation planning or implementation until the user confirms the scenarios are correct.
4. **Only after scenario approval, plan implementation** — Once the user approves the Gherkin, produce or execute the implementation plan as requested. The plan should reference the approved scenarios as the source of truth.

## Phase 2: Implementation

1. **Implement the feature** — Write the actual feature implementation code, follow project guidelines, not this skill.
2. **Implement step definitions** — Write or update step definitions for the steps used in the scenarios. Follow the existing steps writing patterns. Suggest the most appropriate file to add new steps to, inferred from existing file naming.

## Phase 3: Verification

Execute `npx bddgen && npx playwright test` to generate test files from features and run them with Playwright.

Run only the relevant subset of tests by passing the paths of generated spec files to the Playwright CLI. The generated directory is defined by `defineBddConfig()` in `playwright.config.ts` (the `testDir` value).

Example:

```shell
npx bddgen && npx playwright test .features-gen/@homepage/homepage.feature.spec.js
```

## Scenario Writing Rules

- **Scenarios must cover complete end-to-end user flows with a meaningful outcome.** A scenario should describe a user-facing behavior or outcome, not checking intermediate states.

- **Keep the number of scenarios minimal.** Use the fewest scenarios needed to cover the main user flows for the feature.

- **Reuse existing steps when composing scenarios.** Discover existing step definitions and feature files for steps that can be reused in new scenarios before inventing new phrasing. Use `npx bddgen export` or file search tool to list all registered step definitions.

- **Prefer business-aware step names over technical, heavily parameterized ones.**
  Bad: `When('I click {string} on {string}', ...)`
  Good: `When('I click the "Add" button in the product list', ...)`\

- **For multiple similar actions, use single step with a data table instead of multiple steps.** When a scenario involves providing several values of the same kind (e.g. filling form fields, adding list items), consolidate them into one step with a DataTable rather than repeating a step for each value.
  Bad:
  ```gherkin
  When I fill "Name" with "Alice"
  And I fill "Email" with "alice@example.com"
  And I fill "Role" with "Admin"
  ```
  Good:
  ```gherkin
  When I fill the form with:
    | Name  | Alice             |
    | Email | alice@example.com |
    | Role  | Admin             |
  ```

## Scoped Step Definitions

Prefer `@`-prefixed directories to scope step definitions to specific feature domains. This avoids conflicts when common step names (e.g. `I should see {string} text`) need different implementations depending on context.
More details on scoped steps: https://vitalets.github.io/playwright-bdd/#/writing-steps/scoped?id=tags-from-path

**Example structure with scoped steps**

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
    And the cart is empty
    When I add the product "banana" to the cart
    Then the cart contains "banana"
    And the cart badge shows 1
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
