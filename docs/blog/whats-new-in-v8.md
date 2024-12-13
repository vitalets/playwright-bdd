# What's new in Playwright-BDD v8

<div style="color: grey; font-style: italic">14-DEC-2024</div>

**Playwright-BDD v8** is packed with many updates to improve your BDD testing experience.

Here are the highlights:

## Tagging Enhancements

### Support for tags from path
Tags can now be derived from feature file paths, allowing for better organization and filtering of tests. This feature helps teams categorize and run tests more efficiently.

Full documentation: [tags from path](writing-features/tags-from-path.md).

### Scoped step definitions
With this update, you can scope step definitions to specific tags. This provides greater flexibility and ensures that only relevant steps are executed under the desired conditions.

Full documentation: [scoped step definitions](writing-steps/scoped.md).

### Tagged BeforeAll / AfterAll hooks
You can now add `tags` and `name` to `BeforeAll` and `AfterAll` hooks for better traceability and organization. For example:

```javascript
BeforeAll({ name: 'SetupDatabase', tags: ['@db'] }, async () => {
  // Setup logic
});
```

## Improved Configuration Options

### `featuresRoot` as default directory
Simplify your setup by using `featuresRoot` as the default directory for both features and steps unless explicitly defined.

### New `missingSteps` option
Define custom behaviors for scenarios where step definitions are missing. This could range from logging a warning to throwing an error. For example:

```javascript
module.exports = {
  missingSteps: 'warn', // Options: 'warn', 'error', or custom behavior
};
```

### New `matchKeywords` option
Enable keyword matching when searching for step definitions, making step discovery more intuitive. Here’s a sample configuration:

```javascript
module.exports = {
  matchKeywords: true, // Matches keywords like Given, When, Then
};
```

### Default `quote` value set to `single`
Generated files now use single quotes by default, reducing the need for escape characters and making files cleaner.


## Other Changes

### New hook aliases
Introducing new aliases for hooks: `BeforeWorker`, `AfterWorker`, `BeforeScenario`, and `AfterScenario`. These provide clearer semantics for managing different lifecycle stages.

### Localized step titles in reporter
Full localized step titles are now displayed in the Playwright HTML reporter, improving readability and debugging. This ensures your reports are as informative as possible.

### Minimal Playwright version update
Minimal Playwright version was updated to the earliest non-deprecated: **1.41**.

> Check out the [changelog](changelog) for the full list of changes.

## Getting Started with v8

To upgrade to v8, follow these steps:

1. Update your package:

   ```bash
   npm install -D playwright-bdd@latest
   ```

2. Adjust your configuration file to incorporate new options as needed.
3. Review the [changelog](changelog) for potential breaking changes and adapt your project accordingly.
4. Run your tests to verify everything works as expected.

> In case of any bugs or questions feel free to open [an issue](https://github.com/vitalets/playwright-bdd/issues) on GitHub.

Happy testing ❤️

