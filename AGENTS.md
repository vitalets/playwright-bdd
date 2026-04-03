# Agent Rules

- Ask clarifying questions if any requirement, behavior, or constraint is ambiguous. Do not start implementation until all open questions are resolved.
- After any change to TypeScript files, run `npm run tsc`
- After applying changes, query directory names from the `test` dir, guess tests that are relevant to the changes and run only these tests using the command: `npm run only -- test/<dir>/test.mjs`
- When updating `CHANGELOG.md`, if there is a related GitHub issue or pull request, include its link in the changelog entry.
- Prefer Node.js built-in APIs over npm packages where possible. Refer to [module-replacements](https://github.com/es-tooling/module-replacements/blob/main/docs/modules/README.md) for a list of packages that have native alternatives.
- Add a comment to code that is not self-explanatory — when the reason for a change, a workaround, or a non-obvious behavior is not clear from the code itself.
