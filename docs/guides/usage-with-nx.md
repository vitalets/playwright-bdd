# Usage with Nx

Since [Nx](https://nx.dev) has [@nx/playwright](https://nx.dev/nx-api/playwright) plugin,
it is possible to run BDD tests with `nx` and `playwright-bdd`.

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

To be able to run e2e tests inside `app1` or `app2` you can add targets to `project.json` of every app: 
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

Now from workspace root you can run:
```bash
npx nx e2e app1
# or
npx nx e2e app2
```
Also run e2e in **both** `app1` and `app2`:
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
Then in `project.json` just keep empty targets:
```json
{
  "targets": {
    "bddgen": {},
    "e2e": {}
  }
}
```

Check out [working example with Nx and playwright-bdd](https://github.com/vitalets/playwright-bdd-example/tree/nx).