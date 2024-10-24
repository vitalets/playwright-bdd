# Scoped step definitions

By default, step definitions are global and [not bound to a particular feature](https://cucumber.io/docs/cucumber/step-definitions/?lang=javascript#scope). Although that is encouraged by Cucumber design, in big projects it can be tricky to keep steps unique for all possible domains.

Playwright-bdd provides a way to scope step definition to a particular feature or scenario. It works similar to hooks - you can pass `tags` option to step definition, and it will be used only for features matching these tags:
```js
Given('a step', { tags: '@foo' }, async () => {
  // ...
});
```

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

The step should have different implementation for each feature:
```js
// game.steps.js
When('I click the PLAY button', async () => {
  // actions for game
});
```
```js
// video-player.steps.js
When('I click the PLAY button', async () => {
  // actions for video-player
});
```
If I run the example as is, I will get an error:
```
Error: Multiple definitions (2) matched scenario step!
Step: When I click the PLAY button # game.feature:6:5
  - When 'I click the PLAY button' # game.steps.js:5
  - When 'I click the PLAY button' # video-player.steps.js:5
```
To solve the issue I can scope step definition to the corresponding feature by tags:
```js
// game.steps.js
When('I click the PLAY button', { tags: '@game' }, async () => {
  // actions for game
});
```
```js
// video-player.steps.js
When('I click the PLAY button', { tags: '@video-player' }, async () => {
  // actions for video-player
});
```
And set these tags in feature files:
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
Now code runs.
