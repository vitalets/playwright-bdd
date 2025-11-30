# Автоформатирование файлов фич

Написание файлов фич более удобно с автоформатированием. Особенно когда речь идет о таблицах данных.

Ознакомьтесь с форматтером [Prettier](https://prettier.io/) + расширением для IDE + [prettier-plugin-gherkin](https://github.com/mapado/prettier-plugin-gherkin?tab=readme-ov-file).

Вот пример конфигурации Prettier `prettier.config.mjs`:

```js
export default {
  plugins: ['prettier-plugin-gherkin'],
  // ...другие опции prettier
};
```

Как это работает в VS Code:

[auto-formatting](./../../writing-features/_media/auto-formatting.mp4 ':include')
