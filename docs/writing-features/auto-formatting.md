# Auto-formatting feature files

Writing feature files is more convenient with auto-formatting. Especially when it comes to data tables.

Check out [Prettier](https://prettier.io/) formatter + IDE extension + [prettier-plugin-gherkin](https://github.com/mapado/prettier-plugin-gherkin?tab=readme-ov-file).

Here is a sample Prettier configuration `prettier.config.mjs`:

```js
export default {
  plugins: ['prettier-plugin-gherkin'],
  // ...other prettier options
};
```

How it works in VS Code:

[auto-formatting](./_media/auto-formatting.mp4 ':include')