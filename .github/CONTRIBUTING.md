# Contributing to Playwright-BDD

Thank you for considering contributing to Playwright-BDD! 🎉  
This guide will help you get started with contributing.

## How Can I Contribute?

There are different ways to contribute.

### Showcase Your Expertise

We encourage you to share your experiences and insights about using **Playwright-BDD**! BDD workflows can vary widely, and your unique approach could inspire others in the community.  

Here are some ways to share your knowledge:  
- Write articles on platforms like [Dev.to](https://dev.to), [Medium](https://medium.com), or LinkedIn.  
- Share interesting findings, tips, and best practices related to Playwright-BDD or end-to-end testing in general.  
- Promote your content on the [Playwright Discord articles](https://discord.com/channels/807756831384403968/1065556692357619793) and your social networks to reach a broader audience.  

By contributing to the conversation, you'll help grow the Playwright-BDD community and improve testing workflows for everyone!

### Create Bug Reports and Feature Requests 
If you find a bug or have an idea for a feature:
1. Check if the issue already exists in the [Issues](https://github.com/vitalets/playwright-bdd/issues).
2. If not, create a new issue!

### Contribute Code

To contribute code:
1. Fork the [playwright-bdd](https://github.com/vitalets/playwright-bdd) repository.
2. Clone your fork to your local machine:
    ```bash
    git clone https://github.com/<YOUR_USERNAME>/playwright-bdd.git
    ```
3. Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b my-feature
    ```
4. Perform the [development setup](#development-setup)
5. Make and commit your changes.
6. Push the changes to your fork:
    ```bash
    git push origin my-feature
    ```
7. Open [a pull request](https://github.com/vitalets/playwright-bdd/pulls) to the `main` branch.

## Development Setup

1. Install dependencies:
    ```sh
    cd playwright-bdd
    npm install
    ```
2. Install Playwright browsers:
    ```sh
    npx playwright install chromium
    ```
3. Run tests:
    ```sh
    npm t
    # run specific test
    npm run only test/<test-name-in-directory>
    ```
4. Run examples:
    ```sh
    npm run examples
    # run specific example
    npm run examples examples/<example-name-in-directory>
    ```
    note: you may need to run `npm run examples` before commiting, as some pre-commit checks rely on its generated output.

## Useful Dev Commands

### Run a Single Test 
Use the command below (use TAB after typing `test/` to autocomplete the test path):
```
npm run only test/<%test-dir%>
```
Example:
```
npm run only test/special-tags
```

### Switch Playwright Version
This command will install the provided Playwright version without saving it to `package.json`:
```
npx cross-env PW=1.45 npm run pw
```

### Install Playwright Browsers
This command will install `chromium` for the current Playwright version, without clearing previous browsers:
```
npm run pw:browsers
```

### Check Deprecated Playwright Versions
```
npm show @playwright/test@1 deprecated
```

### Clear Playwright Compilation Cache
```
npx playwright clear-cache
```