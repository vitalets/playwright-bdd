# Recipes
Useful recipes for testing with `playwright-bdd`.

## Ignoring generated files
Generated test files should be in `.gitignore` as they are produced from `.feature` files.
Important note that Playwright stores snapshots next to test files, so
instead of ignoring the whole `.features-gen` directory you'd better ignore only `*.spec.js` files:
```
**/.features-gen/**/*.spec.js
```
Another option is to set [`snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template) to custom location out of `.features-gen`. For example:
```ts
export default defineConfig({
  snapshotPathTemplate:
    '__snapshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',
  // ...  
});
```

## Watch mode
To watch feature / steps files and automatically regenerate tests you can use [nodemon](https://github.com/remy/nodemon):
```
npx nodemon -w ./features -w ./steps -e feature,js,ts --exec 'npx bddgen'
```

To automatically rerun tests after changes you can run the above command together with [Playwright `--ui` mode](https://playwright.dev/docs/test-ui-mode), utilizing [npm-run-all](https://github.com/mysticatea/npm-run-all). Example `package.json`:

```json
"scripts": {
  "watch:bdd": "nodemon -w ./features -w ./steps -e feature,js,ts --exec 'npx bddgen'",
  "watch:pw": "playwright test --ui",
  "watch": "run-p watch:*"
}
```

## Debugging

You can debug tests as usual with `--debug` flag:
```
npx bddgen && npx playwright test --debug
```
See more info on debugging in [Playwright docs](https://playwright.dev/docs/debug).