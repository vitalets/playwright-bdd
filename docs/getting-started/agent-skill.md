# Agent Skill

?> Agent Skill is a new feature. Your feedback and suggestions are [welcome](https://github.com/vitalets/playwright-bdd/issues).

Playwright-BDD provides an [agent skill](https://agentskills.io/) that helps AI coding agents generate Gherkin feature files and step definitions, grounded in your actual project steps.

## Supported agents

The skill works with GitHub Copilot, Claude Code, Cursor, Cline, Windsurf, and [many others](https://skills.sh/).

## Installation

Run the following command in your project:

```
npx skills add vitalets/playwright-bdd
```

## Usage

Once the skill installed, the agent follows a structured BDD workflow:

1. **Planning** — Drafts BDD scenarios and asks for your approval. You can iterate on them to clarify the expected outcome before any code is written.
2. **Implementation** — Builds the feature and wires up step definitions that match your existing code style.
3. **Verification** — Runs the generated tests to confirm everything passes.

