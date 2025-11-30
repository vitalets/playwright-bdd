# Ограниченные по области видимости определения шагов

По умолчанию определения шагов глобальные и [не привязаны к конкретной фиче](https://cucumber.io/docs/guides/anti-patterns/#feature-coupled-step-definitions). Хотя это следует дизайну Cucumber, в больших проектах может быть сложно сохранять уникальность шагов для всех возможных доменов.

Playwright-BDD предоставляет способ ограничить определения шагов конкретной фичей или сценарием. Вы можете передать выражение `tags`, сужающее область видимости определения:

```js
Given('a step', { tags: '@foo' }, async () => {
  // ...
});
```

Это определение `a step` будет использоваться только для фич/сценариев с тегом `@foo`. Это позволяет иметь несколько определений одного и того же шага в проекте.

#### Пример
Представьте, что есть две фичи *game* и *video-player*, обе имеющие шаг `I click the PLAY button`:
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

Реализация шага разная для каждой фичи:
```js
// game.steps.js
When('I click the PLAY button', async () => {
  // действия для game.feature
});
```
```js
// video-player.steps.js
When('I click the PLAY button', async () => {
  // действия для video-player.feature
});
```
Если вы запустите пример как есть, вы получите ошибку:
```
Error: Multiple definitions matched scenario step!
Step: When I click the PLAY button # game.feature:6:5
  - When 'I click the PLAY button' # game.steps.js:5
  - When 'I click the PLAY button' # video-player.steps.js:5
```
Чтобы решить проблему, вы можете ограничить определение шага соответствующей фичей через `tags`:
```js
// game.steps.js
When('I click the PLAY button', { tags: '@game' }, async () => {
  // действия для game.feature
});
```
```js
// video-player.steps.js
When('I click the PLAY button', { tags: '@video-player' }, async () => {
  // действия для video-player.feature
});
```
И установить эти теги в файлах фич:
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
Теперь код работает. Каждая фича использует соответствующее определение шага без конфликтов.

## Теги по умолчанию
Вы можете предоставить теги по умолчанию для определений шагов и хуков через опции `createBdd()`:

```ts
// game.steps.ts
const { Given, When, Then } = createBdd(test, { tags: '@game' });

When('I click the PLAY button', async () => {
  // действия для game.feature
});
```

```ts
// video-player.steps.ts
const { Given, When, Then } = createBdd(test, { tags: '@video-player' });

When('I click the PLAY button', async () => {
  // действия для video-player.feature
});
```

## Теги из пути<a id="tags-from-path"></a>
Вы можете предоставить теги по умолчанию для определений шагов и хуков через **директории или имена файлов с префиксом `@`**. Это удобный способ связать ваши шаги и фичи.

Пример:
```
features
├── @game
│   ├── game.feature
│   └── steps.ts
└── @video-player
    ├── video-player.feature
    └── steps.ts
```
Это эквивалентно явному определению тега `@game` в `game.feature` и во всех определениях шагов внутри `@game/steps.ts`. С тегированной директорией вы можете опустить теги из кода - определения шагов будут ограничены автоматически:
```ts
// @game/steps.ts

When('I click the PLAY button', /* { tags: '@game' }, */ async () => {
  // ...
});
```

Вы также можете добавить общие шаги для использования в обеих фичах:

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

Вы можете использовать `@`-тегированные имена файлов также. Это позволяет хранить фичи и шаги отдельно:

```
features
├── @game.feature
└── @video-player.feature
steps
├── @game.ts
└── @video-player.ts
```
