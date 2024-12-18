# Tags from path

Tags from path is a powerful way to automatically assign tags to features via **`@`-prefixed directories or filenames**. It allows binding features to step definitions and reduces explicit tagging.

Example:
```
features
├── @game                     <- sets @game tag to all files inside
│   ├── game.feature
│   └── steps.ts
└── @video-player             <- sets @video-player tag to all files inside
    ├── video-player.feature
    └── steps.ts
```

The path `features/@game/game.feature` automatically assigns the `@game` tag to the feature. It's equivalent to:
```gherkin
@game
Feature: Game

  ...
```

This works with filenames too:
```
features
├── @game.feature
├── @video-player.feature
└── ...
```

Step definitions inside `@`-directories are also [automatically tagged and scoped](writing-steps/scoped.md#tags-from-path) to the related features. All definitions from `@game/steps.ts` are scoped to `@game/game.feature`.

This technique opens new possibilities for organizing and isolating tests.

Moreover, you can utilize [special tags](writing-features/special-tags.md) as directory names:

```
features
└── @game
    ├── @slow                <- for features that need more time
    │   └── feature1.feature
    ├── @skip                <- for features that are not ready
    │   └── feature2.feature 
    ├── @mode:serial         <- for features to run in serial mode
    │   └── feature3.feature
    ├── game.feature
    └── steps.ts
```