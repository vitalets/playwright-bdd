# Env variables

To pass environment variables to both Playwright and Playwright-BDD, follow these steps:

1. Install the `cross-env` package:
   ```
   npm install -D cross-env
   ```

2. Use the `cross-env-shell` command to set environment variables and run your tests:
   ```
   npx cross-env-shell GREETING=hello "npx bddgen && npx playwright test"
   ```

For more details, refer to the [cross-env documentation](https://github.com/kentcdodds/cross-env?tab=readme-ov-file#cross-env-vs-cross-env-shell).