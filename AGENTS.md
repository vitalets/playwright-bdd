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

- Ask clarifying questions if any requirement, behavior, or constraint is ambiguous. Do not start implementation until all open questions are resolved.
- After any change to TypeScript files, run `npm run tsc`
- After applying changes, query directory names from the `test` dir, guess tests that are relevant to the changes and run only these tests using the command: `npm run only -- test/<dir>/test.mjs`
- Never complete commits with `--no-verify`. If commit hooks fail, show the error to the user and ask how to proceed.
- When updating `CHANGELOG.md`, if there is a related GitHub issue or pull request, include its link in the changelog entry.
- Prefer Node.js built-in APIs over npm packages where possible. Refer to [module-replacements](https://github.com/es-tooling/module-replacements/blob/main/docs/modules/README.md) for a list of packages that have native alternatives.
- Add a comment to code that is not self-explanatory — when the reason for a change, a workaround, or a non-obvious behavior is not clear from the code itself.
- Keep exported functions at the top and internal helper functions at the bottom.
- In `test.mjs` files, order code from high-level to low-level: put test cases first, high-level scenario and verification helpers next, setup, fixture, and process helpers after them, and low-level utilities last.
- Do not create `index.ts` files that only re-export symbols. Import directly from the defining module instead.
- Keep orchestration files focused. When a feature introduces a cohesive responsibility with its own policy, constants, I/O, or edge cases, implement it in a dedicated module named after that feature. The caller should only coordinate when to invoke it. Do not embed such behavior as a private method in a broader class unless it is trivial and inseparable from that class.
- In Markdown files, keep each prose paragraph and list item on a single source line. Use line breaks only for semantic structure such as new paragraphs, list items, headings, or code blocks; do not hard-wrap text to a fixed column width.
