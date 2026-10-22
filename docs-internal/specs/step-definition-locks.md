## Problem Statement

Users have scenarios that access shared resources which cannot safely be used concurrently. Playwright supports named test locks, but playwright-bdd currently cannot derive those locks from step definitions. Users need scenarios using resource-sensitive steps to inherit the appropriate scheduling constraints automatically.

This specification covers the step-definition approach discussed in [issue #404](https://github.com/vitalets/playwright-bdd/issues/404). The optional Gherkin lock tags described in the original request are outside this change.

## Solution

Allow step definitions to declare one or more static lock names. During generation, collect the locks of the definitions matched to each scenario, including its Background steps, and attach their deduplicated union to the generated Playwright test. Playwright owns lock acquisition, release, and scheduling.

Locks are declared on step definitions but apply to generated tests; they are not acquired and released around individual step executions. Native Playwright scheduling rules apply, including the broader lock lifetime possible in default and serial modes.

## User Stories

1. As a test author, I want to declare a resource lock on a step definition, so that every scenario matching that definition inherits the constraint.
2. As a test author, I want to declare multiple locks on a step, so that a scenario can protect all resources it uses.
3. As a test author, I want locks from different matched steps combined, so that every declared resource is protected.
4. As a test author, I want repeated lock names deduplicated, so that generated test details remain clear and deterministic.
5. As a test author, I want Feature and Rule Background step locks included, so that shared setup receives the same protection as scenario steps.
6. As a test author, I want each Scenario Outline example to receive locks from its matched definitions, so that examples have the correct constraints.
7. As a Playwright-style step author, I want lock options supported alongside existing step options, so that I can retain my current authoring style.
8. As a Cucumber-style step author, I want equivalent lock support, so that my authoring style does not limit resource protection.
9. As a decorator-based step author, I want equivalent lock support, so that decorated steps participate in the same generation behavior.
10. As a test author using scoped definitions, I want locks collected only from the selected definitions, so that unrelated definitions do not constrain my scenarios.
11. As a test author, I want existing tags and generated test behavior preserved when locks are added, so that this feature composes with existing metadata.
12. As a user of an older Playwright version, I want unaffected projects to keep generating successfully, so that this optional feature does not force an upgrade.
13. As a user requesting locks on an unsupported Playwright version, I want an actionable generation error, so that I know an upgrade is required before running tests.
14. As a test author, I want scenarios skipped during generation to omit locks and compatibility errors, so that non-running scenarios do not impose unused constraints.
15. As a test author, I want scenarios that might skip at runtime to retain their declared locks, so that scheduling remains safe before runtime conditions are known.
16. As an author of reusable step functions, I want the nested-call limitation documented, so that I explicitly declare required locks on the outer matched step.
17. As a maintainer, I want coverage through the established generated-output test harness, so that verification follows existing project conventions.

## Implementation Decisions

- Extend the shared step-definition options with an optional lock accepting a string or an array of strings. Names are static; all supported step styles use the shared contract.
- Use the scenario generator's existing matched-step data, which includes Background steps. Preserve matching, scoping, and duplicate-definition errors.
- Introduce a dedicated generation module for lock collection, deduplication, and compatibility enforcement. Keep the scenario generator responsible for coordinating calls and the formatter responsible for serialization.
- Resolve missing-step skipping before collecting locks. Omit lock collection and compatibility enforcement for scenarios skipped during generation, including explicit skip/fixme tags and the skip-scenario missing-step policy.
- Preserve current behavior that explicitly skipped scenarios do not match step definitions. Do not introduce matching solely to discover their locks.
- For scenarios not skipped during generation, collect every available matched definition's locks, including when a missing-step policy allows failure at runtime. Runtime hooks and conditional skips do not remove statically inferred locks.
- Deduplicate names in first-occurrence order across the matched steps and each declaration's names. Emit an array whenever names are present, and omit the lock property when no names remain.
- Extend generated test details to include locks alongside tags. Preserve existing quoting conventions and unchanged output for tests without locks.
- Check installed Playwright support through the existing compatibility infrastructure. Test locks require Playwright 1.63 or later. When a generated test needs locks on an unsupported version, fail generation with a clear upgrade message. Do not raise the package's minimum supported Playwright version for unaffected users.
- Collect locks only from definitions matched to Gherkin steps. Calls to reusable step functions inside an implementation do not propagate locks; the outer matched definition must declare them explicitly.
- Delegate scheduling entirely to Playwright. Keep test resource locks separate from the project's existing generation/output file-lock mechanism.
- Document the API, generation behavior, native scheduling scope, version requirement, and nested-call limitation.

## Testing Decisions

- Use the existing integration-test boundary: generate tests from feature files and step definitions, then assert the resulting test details and observable generation errors. This boundary exercises registration, matching, collection, and formatting together.
- Follow the existing generated-data conventions used for special tags and related metadata, including the shared generated-file assertion helpers. Avoid tests coupled to private helper structure.
- Cover single and multiple locks, unions across steps, deduplication and stable ordering, omitted empty lock details, and coexistence with tags.
- Cover Playwright-style, Cucumber-style, and decorated definitions; Feature and Rule Backgrounds; Scenario Outline examples; and scoped matching.
- Cover generation-time skips, missing-step skip behavior, and retention of locks when skipping or failure can occur only at runtime.
- Cover quoting and escaping through the existing formatter conventions, and assert unchanged generated details for scenarios without locks.
- Follow existing version-dependent integration-test conventions: supported versions verify generated lock details, while older versions verify the upgrade error when locks are needed and successful generation when they are not.
- Do not add a separate concurrency or timing-based test of Playwright's scheduler.
- Run TypeScript checking after TypeScript changes and the relevant targeted repository test suites after implementation.

## Out of Scope

- Gherkin lock tags on Features, Rules, Scenarios, or Examples.
- Dynamic or parameter-derived lock names.
- Lock acquisition and release around individual step executions.
- Automatic propagation through nested reusable step-function calls.
- New hook-level or global/default lock configuration.
- A custom scheduler, cross-process locking implementation, or changes to generation/output file locking.
- Raising the minimum supported Playwright version for users who do not use locks.

## Further Notes

The requirements and technical decisions above were agreed during the design discussion. The testing approach follows the user's explicit request to use the same conventions as other generated test data.

This specification records the plan; implementation has not started. The original issue remains the source request, and its optional tag-based proposal is intentionally outside this specification.
