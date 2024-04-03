# Env variables

To pass environment variables to both Playwright and Playwright-bdd,
you can use `cross-env-shell` command from [cross-env](https://github.com/kentcdodds/cross-env?tab=readme-ov-file#cross-env-vs-cross-env-shell) package:

```
npx cross-env-shell GREETING=hello "npx bddgen && npx playwright test"
```