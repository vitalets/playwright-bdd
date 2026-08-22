# Why Playwright VS Code Currently Needs External Source Maps

## Decision

External source maps are required only when generated tests need to be discovered through the
current official [Playwright Test for VS Code extension](https://github.com/microsoft/playwright-vscode).
They are not a requirement of the Playwright runner itself.

For VS Code scenario-level discovery, Playwright-BDD should emit an external source-map file next to
every generated Playwright test:

```text
.features-gen/features/users.feature.spec.js
.features-gen/features/users.feature.spec.js.map
```

The generated test should reference that file with a relative URL:

```js
//# sourceMappingURL=users.feature.spec.js.map
```

This external format enables the extension to associate generated Playwright tests with their
original `.feature` files and show run/debug controls in the editor gutter.

When VS Code discovery is not needed, inline source maps are valid. Playwright resolves them for
test execution, CLI locations, reports, stack traces, and trace source locations.

## Scope of the Requirement

There are two separate source-map consumers:

1. **The Playwright runner** loads the generated test and understands both inline and external
   source maps.
2. **The Playwright VS Code extension** performs an earlier file-discovery step. Its current
   resolver understands external map files but not inline `data:` URLs.

Therefore, an inline map is not broken from Playwright's perspective. It becomes a problem only when
the VS Code extension needs to identify the original source file before loading the individual
tests.

## Problem

Playwright-BDD generates JavaScript tests from Gherkin scenarios. Playwright can use a source map to
report the generated tests at their original feature-file locations:

```text
[chromium] › ../features/users.feature:3:3 › Users Page › Display list of users
[chromium] › ../features/users.feature:8:3 › Users Page › Show user details
```

This mapping works in the Playwright runner with both external and inline source maps. VS Code test
discovery has an additional constraint, however: the extension performs its own source-map lookup
before it loads individual tests.

The extension currently:

1. Reads the final `//# sourceMappingURL=...` line from each generated JavaScript test.
2. Resolves that value as a filesystem path relative to the generated test.
3. Reads the resolved `.map` file and registers its `sources` as test files.
4. Uses those source files and mapped test locations to create Test Explorer items and gutter
   controls.

The implementation is visible in the extension's
[`resolveSourceMap()` function](https://github.com/microsoft/playwright-vscode/blob/main/src/utils.ts#L57-L89).

## Why Inline Source Maps Break the Gutter Controls

An inline source map uses a data URL:

```js
//# sourceMappingURL=data:application/json;charset=utf-8;base64,...
```

The current VS Code resolver does not decode this data URL. It passes the entire value to
`path.resolve()` and then tries to read it as a file. That read fails, the error is silently ignored,
and the extension falls back to the generated `.spec.js` file.

As a result:

- Playwright CLI output can still point to `features/users.feature`.
- Test execution still works.
- Playwright reports, stack traces, and traces can still use the original mapped locations.
- The VS Code Test Explorer initially sees the generated `.features-gen/**/*.spec.js` file.
- No VS Code test item is attached to a `Scenario:` line in the `.feature` file.
- VS Code therefore has no green run/debug gutter control to render for the scenario.

This is specifically a VS Code discovery incompatibility. It is not a Playwright runner or Gherkin
parsing failure. Cucumber syntax-highlighting and autocomplete extensions do not create Playwright
test items and cannot repair this mapping.

## Compatibility Evidence

Playwright-BDD `9.3.2-beta.0` emitted external `.map` files. Its generated JavaScript referenced the
map by filename, which matches the format understood by the Playwright VS Code extension.

On August 22, 2026, Playwright-BDD changed source maps from external files to inline data URLs in
[`da481e1`](https://github.com/vitalets/playwright-bdd/commit/da481e136e8bdd6ef5b3335661e6e2d5ea688326).
That change produced the compatibility regression described above in `9.3.3-beta.0`.

The regression is limited to integration with the current VS Code extension. The Playwright runner
continues to handle the inline maps correctly.

The original request to run scenarios from feature files is tracked in
[`playwright-bdd#297`](https://github.com/vitalets/playwright-bdd/issues/297).
Inline source-map support in the Playwright VS Code extension is tracked in
[`microsoft/playwright#42364`](https://github.com/microsoft/playwright/issues/42364).

## Comparison

| Behavior                            | External `.map` file          | Inline data URL                    |
| ----------------------------------- | ----------------------------- | ---------------------------------- |
| Playwright CLI locations            | Works                         | Works                              |
| Playwright reports and stack traces | Works                         | Works                              |
| Playwright trace source locations   | Works                         | Works                              |
| Current VS Code file discovery      | Works                         | Does not resolve the original file |
| Scenario gutter run/debug controls  | Works                         | Missing                            |
| Extra generated artifact            | One `.map` per generated test | None                               |
| Git/formatter ignore rule required  | Yes                           | No                                 |

Inline maps avoid an extra generated artifact and work with the Playwright runner. External maps are
the appropriate compatibility choice only when current VS Code discovery and gutter controls are a
requirement.

## VS Code Compatibility Recommendation

Until the VS Code extension supports inline source maps, projects that require Test Explorer
discovery and scenario gutter controls should:

1. Generate `<test>.spec.js.map` before publishing `<test>.spec.js`, so readers never observe a
   JavaScript file that points to a missing map.
2. End the generated JavaScript with a relative source-map reference:

   ```js
   //# sourceMappingURL=users.feature.spec.js.map
   ```

3. Keep the feature path in the map's `sources` array relative to the map file.
4. Include `sourcesContent` so reports and tooling can display the exact Gherkin source used during
   generation.
5. Clean up stale `.spec.js` and `.spec.js.map` files together.
6. Ignore both generated artifacts in Git and formatting tools:

   ```gitignore
   **/.features-gen/**/*.spec.js
   **/.features-gen/**/*.spec.js.map
   ```

This recommendation is a temporary integration workaround, not a limitation of the Playwright
runner. A generator can reasonably use inline maps when VS Code discovery is outside its supported
workflow. If it supports both workflows, it can expose the map format as an option or use external
maps until [`microsoft/playwright#42364`](https://github.com/microsoft/playwright/issues/42364) is
resolved.

## Verification

Verify the Playwright runner independently from the VS Code integration.

For either map format:

1. Confirm that `npx playwright test --list` reports the `.feature` file and scenario lines.
2. Run the tests and confirm that reports, failures, and traces point to the original feature
   locations.

For the current VS Code extension with external maps:

1. Confirm that both `.spec.js` and `.spec.js.map` exist.
2. Reload the Playwright extension or the VS Code window.
3. Confirm that the Testing sidebar contains `features/users.feature`.
4. Open the feature file and confirm that run/debug controls appear next to each `Scenario:` line.
5. Click each control and confirm that only the selected scenario runs.

Keeping these checks separate makes the boundary clear: inline maps can pass every runner check
while failing only the VS Code extension's earlier file-discovery step.
