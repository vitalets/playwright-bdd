# Tags from path

**Tags from path** is a powerful way to automatically assign tags to features via `@`-prefixed directories or filenames. It allows to bind feature with step definitions without explicitly defining tags in the code.

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

Storing `game.feature` inside `@game` directory is equivalent to have that tag defined in the feature file:
```gherkin
@game # <- you don't need this tag is stored in '@game' directory
Feature: Game

  Scenario: Start playing
    ... 
    When I click the PLAY button
```

Step definitions are also [automatically tagged and scoped](writing-steps/scoped.md#tags-from-path) to the related features.