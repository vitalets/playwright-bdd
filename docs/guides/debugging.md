# Debugging

You can use any of [Playwright debugging methods](https://playwright.dev/docs/debug) for BDD tests.

## Run tests with `--debug` flag

This command opens the browser and allows step-by-step evaluation:

```
npx bddgen && npx playwright test --debug
```

Example screenshot:

![debug-flag](./_media/debug-flag.png)

## Run tests with `--ui` flag

This command runs BDD tests in UI mode:

```
npx bddgen && npx playwright test --ui
```

More details on [UI mode](guides/ui-mode.md).