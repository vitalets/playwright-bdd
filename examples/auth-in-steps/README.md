# auth-in-steps playwright-bdd example

Example of dynamic authentication in BDD steps. It allows you to dynamically authenticate with needed account via steps, e.g.:
```
Given I am logged in as "xxx@example.com"
```

The main challenge with dynamic authentication - steps run *after* all fixtures, so you can't switch to particular account in `storageState` fixture.

Also, it'is impossible to re-assign storage state of already running browser context.

The solution is similar to [testing multiple roles together](https://playwright.dev/docs/auth#testing-multiple-roles-together). Create browser context manually inside BDD step, save it to shared fixture and use in other steps instead of default `page` fixture.

For saving videos in such setup please check-out [this comment](https://github.com/vitalets/playwright-bdd/issues/185#issuecomment-2245064212).