# Gherkin Rules

- **Scenarios must cover complete end-to-end user flows with a meaningful outcome.** A scenario should describe a user-facing behavior or outcome, not checking intermediate states.
- **One scenario = one behavior.** Each scenario should verify a single meaningful interaction or state.
- **Keep the number of scenarios minimal.** Use the fewest scenarios needed to cover the main user flows for the feature.
- **Always show the target feature file path** when presenting scenarios, so it's clear where the scenario will be added or modified.
- **Show diff when needed** When presenting changes to existing scenarios, use unified diff format (```diff) to clearly show additions and removals. For entirely new scenarios, show them in plain Gherkin format.
- **Reuse existing steps when composing scenarios.** Check existing step definitions and feature files for steps that can be reused in new scenarios before inventing new phrasing.
- **Prefer business-aware step names over technical, heavily parameterized ones.**
  Bad: `When('I click {string} button on {string} page', ...)`
  Good: `When('I click the "Add" button', ...)`
- **Cucumber expression parameters** — `{string}` values must be written in `"double quotes"`, `{int}` is a bare integer, `{float}` is a bare decimal. When writing a step that matches a registered pattern, only substitute the parameter placeholders with values — never rephrase or alter the surrounding pattern text.
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
