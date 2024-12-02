# Tags from path

**Tags from path** is a powerful way to assign tags to features via `@`-prefixed directories or filenames. It allows to bind feature with step definitions without explicitly defining tags in the code.

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

Storing `game.feature` inside `@game` directory is equivalent to having that tag defined in the feature file:
```gherkin
@game
Feature: Game

  Scenario: Start playing
    ... 
    When I click the PLAY button
```

Step definitions inside `@`-directories are also [automatically tagged and scoped](writing-steps/scoped.md#tags-from-path) to the related features.