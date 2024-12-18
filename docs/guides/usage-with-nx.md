# Usage with Nx

You can run Playwright-BDD tests with [Nx](https://nx.dev) and [@nx/playwright](https://nx.dev/nx-api/playwright) plugin.

Imagine the following workspace structure:
```
/app1
  /e2e
  ...
  project.json
  playwright.config.ts
/app2
  /e2e
  ...
  project.json
  playwright.config.ts
nx.json
```

To run e2e tests inside `app1` or `app2`, add targets to the `project.json` of each app:
```json
{
  "targets": {
    "bddgen": {
      "command": "bddgen",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "dependsOn": ["bddgen"],
      "options": {
        "config": "{projectRoot}"
      }
    }
  }
}
```

Now, from the workspace root you can run:
```bash
npx nx e2e app1
# or
npx nx e2e app2
```

To run e2e tests in **both** `app1` and `app2`:
```bash
npx nx run-many -t e2e -p app1 app2
```

If there are many projects with the same e2e setup, you can move default settings to `nx.json`:
```json
{
  "targetDefaults": {
    "bddgen": {
      "command": "bddgen",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "dependsOn": ["bddgen"],
      "options": {
        "config": "{projectRoot}"
      }
    }
  }
}
```

Then, in `project.json` keep empty targets:
```json
{
  "targets": {
    "bddgen": {},
    "e2e": {}
  }
}
```

Check out the [working example with Nx and playwright-bdd](https://github.com/vitalets/playwright-bdd-example/tree/nx).