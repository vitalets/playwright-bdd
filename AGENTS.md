# Agent Rules

- Ask clarifying questions if any requirement, behavior, or constraint is ambiguous. Do not start implementation until all open questions are resolved.
- After any change to TypeScript files, run `npm run tsc`
- After applying changes, query directory names from the `test` dir, guess tests that are relevant to the changes and run only these tests using the command: `npm run only -- test/<dir>/test.mjs`
