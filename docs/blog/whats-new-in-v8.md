# What's new in Playwright-BDD v8

<div style="color: grey; font-style: italic">14-DEC-2024</div>

**Playwright-BDD v8** is packed with many updates to improve your BDD testing experience.

## Tagging Enhancements

### Tags from path

Tags can now be derived from file paths, if there are **`@`-prefixed directories or filenames**:

```
features
├── @game                     <- sets @game tag to all files inside
│   ├── game.feature
│   └── steps.ts
└── @video-player             <- sets @video-player tag to all files inside
    ├── video-player.feature
    └── steps.ts
```    

Step definitions and hooks inside `@`-prefixed directory become scoped to the related features.
This technique allows to isolate your BDD tests into separate domains.

See more details in the documentation: [tags from path](writing-features/tags-from-path.md).

### Scoped step definitions

Now you can scope step definition to specific features or scenarios by tags. Just pass `tags` expression in the second argument:

```ts
When('I click the PLAY button', { tags: '@game' }, async () => {
  // ...
});
```

With tags, you can have multiple definitions of the same step, that is crucial for large applications:

```ts
When('start playing', { tags: '@game' }, async () => { ... });
When('start playing', { tags: '@video-player' }, async () => { ... });
```

Full documentation: [scoped step definitions](writing-steps/scoped.md).

### Tagged BeforeAll / AfterAll
Until Playwright-BDD v8, you could set tags only to scenario-level hooks `Before / After`.
Now worker-level hooks `BeforeAll / AfterAll` are also can be tagged:

```ts
BeforeAll({ tags: '@game' }, async () => {
  // worker setup for game
});

AfterAll({ tags: '@game' }, async () => {
  // worker teardown for game
});
```

Please keep in mind, that these hooks **run in each worker**, like Playwright hooks do.

Full documentation: [Hooks](writing-steps/hooks.md).

### Default tags

If multiple step definitions and hooks should have common tags, you can provide these tags via `createBdd()` option:

```ts
const { BeforeAll, Before, Given } = createBdd(test, { tags: '@game' });

BeforeAll(async () => { ... });       // <- tagged with '@game'
Before(async () => { ... });          // <- tagged with '@game'
Given('a step', async () => { ... }); // <- tagged with '@game'
```

Full list for [createBdd() options](api.md#createbdd).

## Improved Configuration Options

### `featuresRoot` as a default directory
Since Playwright-BDD v8, `featuresRoot` is treated as a default directory for both features and steps, unless they are explicitly defined. It simplifies the configuration for a typical project:
```ts
// before
const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: './features/steps/**/*.js',
  featuresRoot: './features',
});

// after
const testDir = defineBddConfig({
  featuresRoot: './features',
});
```

Documentation for [`featuresRoot`](configuration/options.md#featuresroot).

### New option: `missingSteps`
In some projects, features are written far earlier than step definitions. 
Until v8, if Playwright-BDD detected feature with missing steps, it exited and showed step snippets.
With new `missingSteps` option you can control this behavior:

```ts
const testDir = defineBddConfig({
  missingSteps: 'fail-on-gen', // can be 'fail-on-gen', 'fail-on-run' or 'skip-scenario'
  // ...
});
```

Documentation for [`missingSteps`](configuration/options.md#missingsteps).

### New option: `matchKeywords`
Enable keyword matching when searching for step definitions, making step discovery more intuitive. Here’s a sample configuration:

```javascript
module.exports = {
  matchKeywords: true, // Matches keywords like Given, When, Then
};
```

### Default value for `quote` set to `single`
Generated files now use single quotes by default, reducing the need for escape characters and making files cleaner.


## Other Changes

### Hook aliases
Introducing new aliases for hooks: `BeforeWorker`, `AfterWorker`, `BeforeScenario`, and `AfterScenario`. These provide clearer semantics for managing different lifecycle stages.

### Localized step titles
Full localized step titles are now displayed in the Playwright HTML reporter, improving readability and debugging. This ensures your reports are as informative as possible.

### Playwright version update
Minimal Playwright version was updated to the earliest non-deprecated: **1.41**.
Please, update you `@playwright/test` dependency if needed.

?> You can check deprecated Playwright versions with the command: `npm show @playwright/test@1 deprecated`

---

Check out the full list of changes in the [Changelog](changelog).

## Getting Started with v8

To upgrade to v8, follow these steps:

1. Update your package:

   ```bash
   npm install -D playwright-bdd@latest
   ```

2. Adjust your configuration file to incorporate new options as needed.
3. Review the [Changelog](changelog) for potential breaking changes and adapt your project accordingly.
4. Run your tests to verify everything works as expected.

> In case of any bugs or questions feel free to open [an issue](https://github.com/vitalets/playwright-bdd/issues) on GitHub.

Happy testing ❤️

