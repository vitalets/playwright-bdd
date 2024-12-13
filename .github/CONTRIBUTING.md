# Contributing to Playwright-BDD

Thank you for considering contributing to Playwright-BDD! 🎉  
This guide will help you get started with contributing.

## How Can I Contribute?

### Bug Reports
If you find a bug:
1. Check if the issue is already reported in the [Issues](https://github.com/vitalets/playwright-bdd/issues).
2. If not, create a new issue:
   - Use a clear and descriptive title.
   - Provide steps to reproduce the issue.
   - Try to include demo and logs.

### Feature Requests
Have an idea for a feature?
- Check if it's already proposed in the [Issues](https://github.com/vitalets/playwright-bdd/issues).
- Open a new issue describing your idea and its potential benefits.

### Pull Requests
To contribute code:
1. Fork the [playwright-bdd](https://github.com/vitalets/playwright-bdd) repo.
2. Clone your fork to the local machine:
    ```
    git clone https://github.com/<YOU_NAME>/playwright-bdd.git
    ```
3. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b my-feature
   ```
4. Perform [development setup](#development-setup) if needed.
5. Make and commit your changes.
6. Push the changes to your fork:
   ```bash
   git push origin my-feature
   ```
7. Open [a pull request](https://github.com/vitalets/playwright-bdd/pulls) to the `main` branch.   

## Development Setup

1. Install dependencies:
    ```
    cd playwright-bdd
    npm install
    ```
2. Install Playwright browsers:
    ```
    npx playwright install chromium
    ```
3. Run tests
    ```
    npm t
    ```

## Useful dev commands

### Run single test 
Use the command below (use TAB after typing `test/` to autocomplete test path):
```
npm run only test/<%test-dir%>
```
Example:
```
npm run only test/special-tags
```

### Switch Playwright version
This command will install provided Playwright version without saving it to `package.json`:
```
npx cross-env PW=1.45 npm run pw
```

### Install Playwright browsers
This command will install `chromium` for the current Playwright version, without clearing previous browsers:
```
npm run pw:browsers
```

### Check deprecated Playwright versions
```
npm show @playwright/test@1 deprecated
```

### Clear Playwright compilation cache
```
npx playwright clear-cache
```