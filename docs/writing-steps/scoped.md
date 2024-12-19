# Scoped step definitions

By default, step definitions are global and [not bound to a particular feature](https://cucumber.io/docs/cucumber/step-definitions/?lang=javascript#scope). Although it follows Cucumber design, in large projects it can be tricky to keep steps unique for all possible domains.

Playwright-BDD provides a way to scope step definitions to a particular feature or scenario. You can pass a `tags` expression, narrowing the scope of the definition:

```js
Given('a step', { tags: '@foo' }, async () => {
  // ...
});
```

This definition of `a step` will be used only for features/scenarios with the `@foo` tag. It allows having multiple definitions of the same step in a project.

#### Example
Imagine there are two features *game* and *video-player*, both having a step `I click the PLAY button`:
```gherkin
Feature: Game

  Scenario: Start playing
    ... 
    When I click the PLAY button
```
```gherkin
Feature: Video player

  Scenario: Start playing
    ... 
    When I click the PLAY button
```

The implementation of the step is different for each feature:
```js
// game.steps.js
When('I click the PLAY button', async () => {
  // actions for game.feature
});
```
```js
// video-player.steps.js
When('I click the PLAY button', async () => {
  // actions for video-player.feature
});
```
If you run the example as is, you will get an error:
```
Error: Multiple definitions matched scenario step!
Step: When I click the PLAY button # game.feature:6:5
  - When 'I click the PLAY button' # game.steps.js:5
  - When 'I click the PLAY button' # video-player.steps.js:5
```
To solve the issue, you can scope the step definition to the corresponding feature by `tags`:
```js
// game.steps.js
When('I click the PLAY button', { tags: '@game' }, async () => {
  // actions for game.feature
});
```
```js
// video-player.steps.js
When('I click the PLAY button', { tags: '@video-player' }, async () => {
  // actions for video-player.feature
});
```
And set these tags in the feature files:
```gherkin
@game
Feature: Game

  Scenario: Start playing
    ... 
    When I click the PLAY button
```
```gherkin
@video-player
Feature: Video player

  Scenario: Start playing
    ... 
    When I click the PLAY button
```
Now the code runs. Each feature uses the respective step definition without conflicts.

## Default tags
You can provide default tags for step definitions and hooks via `createBdd()` options:

```ts
// game.steps.ts
const { Given, When, Then } = createBdd(test, { tags: '@game' });

When('I click the PLAY button', async () => {
  // actions for game.feature
});
```

```ts
// video-player.steps.ts
const { Given, When, Then } = createBdd(test, { tags: '@video-player' });

When('I click the PLAY button', async () => {
  // actions for video-player.feature
});
```

## Tags from path
You can provide default tags for step definitions and hooks via **`@`-prefixed directories or filenames**. It is a convenient way to bind your steps and features.

Example:
```
features
├── @game
│   ├── game.feature
│   └── steps.ts
└── @video-player
    ├── video-player.feature
    └── steps.ts
```
This is equivalent to having the `@game` tag explicitly defined in the `game.feature` and in all step definitions inside `@game/steps.ts`. With a tagged directory, you can omit tags from the code - step definitions will be scoped automatically:
```ts
// @game/steps.ts

When('I click the PLAY button', /* { tags: '@game' }, */ async () => {
  // ...
});
```

You can also add shared steps to be used in both features:

```
features
├── @game
│   ├── game.feature
│   └── steps.ts
├── @video-player
│   ├── video-player.feature
│   └── steps.ts
└── shared-steps.ts
```

You can use `@`-tagged filenames as well. It allows you to store features and steps separately:

```
features
├── @game.feature
└── @video-player.feature
steps
├── @game.ts
└── @video-player.ts
```
