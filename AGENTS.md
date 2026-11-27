# Agent Rules

## Project structure

- `src/` — package source code.
- `test/` — automated tests and test fixtures.
- `docs/` — public user documentation.
- `docs-internal/` — internal technical documentation; check it for relevant context before making non-trivial implementation decisions.
- `examples/` — example projects demonstrating supported usage.
- `scripts/` — development, build, release, and repository-maintenance scripts.
- `skills/` — agent skills distributed with the project.

## Reviewing implementation decisions

- When the user asks about a decision, possibility, or alternative approach, investigate the relevant code without modifying files.
- Present the findings and propose a concrete plan. When useful, include code snippets or diffs illustrating the available approaches.
- Wait for the user to review the proposal and explicitly approve an approach before implementing it.
- If the requested approach requires a workaround, explain the limitation and propose the workaround. Get the user's explicit approval of that specific workaround before applying it.

- Ask clarifying questions if any requirement, behavior, or constraint is ambiguous. Do not start implementation until all open questions are resolved.
- After any change to TypeScript files, run `npm run tsc`
- When creating test directories, follow the established structure of similar tests: keep feature files and step definitions under `features/`, with the test runner, configuration, and package metadata at the test directory root.
- In `test.mjs`, use `testDir.name` in test titles. Use generic numbered Gherkin scenario titles in fixtures, such as `Scenario 1` and `Scenario 2`. Consolidate related cases into existing fixtures where practical.
- Use the simplest step text that exercises the behavior under test. Prefer neutral wording such as `a step` when the test does not need domain-specific language.
- Select the scenarios each test verifies explicitly and name the test for that behavior. Give unrelated scenarios their own test cases, even when they share a fixture.
- Prefer separate feature files selected through the `FEATURES` environment variable. Use Gherkin tags when they affect the behavior under test.
- When step definitions belong to a single feature and grouping them helps navigation, put both files in a subdirectory under `features/`. Give the directory and feature file the same descriptive name, such as `indexed-step-search/indexed-step-search.feature`, and name the dedicated step file `steps.ts`. Choose a name that describes the behavior under test.
- Prefer named helpers for test infrastructure such as fixture setup, process options, and reading or parsing reports. Keep scenario selection and expected behavior visible in the test case.
- After applying changes, query directory names from the `test` dir, guess tests that are relevant to the changes and run only these tests using the command: `npm run only -- test/<dir>/test.mjs`
- Never complete commits with `--no-verify`. If commit hooks fail, show the error to the user and ask how to proceed.
- Keep `CHANGELOG.md` entries concise and focused on user-visible changes. Omit minor implementation details and link to the related GitHub issue or pull request when available.
- Prefer Node.js built-in APIs over npm packages where possible. Refer to [module-replacements](https://github.com/es-tooling/module-replacements/blob/main/docs/modules/README.md) for a list of packages that have native alternatives.
- Add a comment to code that is not self-explanatory — when the reason for a change, a workaround, or a non-obvious behavior is not clear from the code itself.
- Keep exported functions at the top and internal helper functions at the bottom.
- In `test.mjs` files, order code from high-level to low-level: put test cases first, high-level scenario and verification helpers next, setup, fixture, and process helpers after them, and low-level utilities last.
- Do not create `index.ts` files that only re-export symbols. Import directly from the defining module instead.
- Keep orchestration files focused. When a feature introduces a cohesive responsibility with its own policy, constants, I/O, or edge cases, implement it in a dedicated module named after that feature. The caller should only coordinate when to invoke it. Do not embed such behavior as a private method in a broader class unless it is trivial and inseparable from that class.
- In Markdown files, keep each prose paragraph and list item on a single source line. Use line breaks only for semantic structure such as new paragraphs, list items, headings, or code blocks; do not hard-wrap text to a fixed column width.
