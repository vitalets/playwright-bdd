## Basic usage of Playwright-BDD in TypeScript project (CommonJS)

Most important files:
- `playwright.config.ts` - configuration for Playwright and Playwright-BDD
- `features/homepage.feature` - feature file for testing Playwright homepage
- `features/steps/index.ts` - step definitions

### Run tests
```
npm t
```

Output:
```
Running 2 tests using 1 worker
  2 passed (2.9s)
```

### Report
```
npm run report
```
![image](https://github.com/user-attachments/assets/2ab4bf0f-28db-4ba3-8b0d-6e546299e3b6)