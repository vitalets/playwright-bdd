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

Once installed, you can ask your AI agent things like:
- *Create a feature file for the login flow*
- *Add a scenario for the checkout page*
- *Write BDD tests for the search functionality*

The agent will inspect your Playwright BDD configuration, list available steps, and produce a `.feature` file that fits your project. If any required steps are missing, it will also suggest their implementations.

