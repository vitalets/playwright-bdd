# Watch mode

Use [nodemon](https://github.com/remy/nodemon) to watch features and steps files and automatically regenerate tests:
```
npx nodemon -w ./features -w ./steps -e feature,js,ts --exec "npx bddgen"
```

To automatically rerun tests after changes, run the above command together with [Playwright `--ui` mode](https://playwright.dev/docs/test-ui-mode), utilizing [npm-run-all](https://github.com/mysticatea/npm-run-all). Example `package.json`:

```json
"scripts": {
  "watch:bdd": "nodemon -w ./features -w ./steps -e feature,js,ts --exec \"npx bddgen\"",
  "watch:pw": "playwright test --ui",
  "watch": "run-p watch:*"
}
```
