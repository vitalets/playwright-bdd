# Agent Skill

Playwright-BDD provides an [agent skill](https://agentskills.io/) that helps AI coding agents generate Gherkin feature files and step definitions. The skill teaches the agent to discover your existing steps via `npx bddgen` and write feature files that reuse them, instead of inventing steps that don't exist.

Install it with a single command:

```
npx skills add vitalets/playwright-bdd
```

Once installed, you can ask your AI agent things like:
- *"Create a feature file for the login flow"*
- *"Add a scenario for the checkout page"*
- *"Write BDD tests for the search functionality"*
