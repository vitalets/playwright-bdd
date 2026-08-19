---
name: playwright-bdd
description: 'Enforces Behavior Driven Development. Use when: implementing new features, making significant code changes, adding functionality, refactoring behavior. Requires writing a Gherkin feature file first, getting user approval, then implementing.'
---

# Playwright BDD

## Phase 0: BDD Necessity Check

For every user-requested task, first decide whether the requested outcome needs to be specified in new or updated BDD scenarios. Base this decision on changes to observable product behavior, not on the size of the code change or the number of files involved.

BDD feature-file changes are needed when the task:

- Explicitly requests adding, updating or removing BDD scenarios.
- Adds, removes, or changes user-observable behavior or an end-to-end user outcome.
- Changes a user flow, acceptance criterion, validation rule, permission, or user-visible error behavior.
- Fixes a bug whose expected behavior is missing from, or inaccurately described by, the existing scenarios.

BDD feature-file changes are not needed when the task:

- Refactors or reorganizes implementation while preserving existing observable behavior.
- Changes documentation, comments, formatting, tooling, or other development infrastructure without changing product behavior.
- Makes presentation-only visual or geometric adjustments without changing user interaction or meaning.
- Implements or fixes behavior that is already accurately specified by existing scenarios and does not require their wording or coverage to change.
- Changes only step definitions or test infrastructure while leaving the specified product behavior unchanged.

After making this assessment:

- If BDD feature-file changes are needed, continue directly to Phase 1 without asking for confirmation.
- If BDD feature-file changes are not needed, continue with the user's task immediately without creating or modifying any `.feature` files and without stopping for confirmation.
- If the assessment is genuinely unclear, ask only: **"Is BDD scenarios update needed for this change?"** Then wait for the user's answer. Do not explain why the question is being asked or provide any details, reasoning, or recommendation with it.
- If the user answers yes, continue to Phase 1. If the user answers no, continue with the user's task without changing `.feature` files.

## Phase 1: Planning

1. **Discover project configuration** — Search `playwright.config.ts` (or `playwright.config.js`) for `defineBddConfig(...)` calls. This reveals the features directory and the `steps` glob patterns pointing to step definition files.
   - If multiple `defineBddConfig` calls exist, pick the most suitable one based on context (e.g. match directory names to the described feature area). Only ask the user to clarify if it is genuinely ambiguous.
2. **Write BDD scenarios** — Check the existing feature files and create or update BDD scenarios according to the input. Strictly follow the "Scenario Writing Rules" section.
3. **Show feature-file changes to the user and use the question tool with the question "Approve the proposed feature-file changes?"** — Show the exact new or changed Gherkin content to the user for negotiation:
   - When presenting changes to existing scenarios, use unified diff format (```diff) to clearly show additions and removals. For entirely new scenarios, show them in plain Gherkin format.
   - Always show the target feature file path, so it's clear where the scenario will be added or modified.
   - In the question tool use a concise approval question: "Approve the proposed feature-file changes?", don't show the full diff in the question itself.
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

- **For multiple similar actions, prefer single step with a data table instead of multiple steps.** When a scenario involves providing several values of the same kind (e.g. filling form fields, adding list items), consolidate them into one step with a DataTable rather than repeating a step for each value.
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

- **Add a short description to every feature.** Immediately below each `Feature:` line, add an indented one- or two-sentence description of the feature's main user-facing purpose. Use simple, concrete statements and the project's existing domain terms. Describe the feature as a whole; do not list scenarios, edge cases, or implementation details. Leave a blank line before and after the description.

- **Append new scenarios.** When adding a scenario to an existing feature file, place it after all existing scenarios. Do not insert it at the beginning or between existing scenarios unless the user explicitly requests a specific location.

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
  Customers can collect products they intend to buy and review the current cart contents.

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
