# auth-in-steps playwright-bdd example

Example of dynamic authentication in BDD steps. It allows you to dynamically authenticate with needed account via steps, e.g.:
```
Given I am logged in as "xxx@example.com"
```

The main challenge with dynamic authentication - steps run *after* all fixtures setup, so you can't switch `storageState` fixture to a particular account.

## Solution 

1. Initialize browser context manually inside BDD step (see [testing multiple roles together](https://playwright.dev/docs/auth#testing-multiple-roles-together))
2. Use own `ctx` fixture to pass authenicated `page` between steps (see [passing data between steps](https://vitalets.github.io/playwright-bdd/#/writing-steps/passing-data-between-steps))

For saving videos in such setup please check-out [this comment](https://github.com/vitalets/playwright-bdd/issues/185#issuecomment-2245064212).