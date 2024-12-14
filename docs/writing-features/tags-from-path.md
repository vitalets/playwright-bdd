# Tags from path

Tags from path is a powerful way to automatically assign tags to features via **`@`-prefixed directories or filenames**. It allows to bind features to step definitions and reduce explicit tagging.

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

The path `features/@game/game.feature` automatically assigns `@game` tag to the feature. It's equivalent to:
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

This technique opens new possibilities for tests organizing and isolation. 

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