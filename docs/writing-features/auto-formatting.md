# Auto-formatting feature files

Writing feature files is more convenient with auto-formatting. Especially when it comes to data tables.

Check out [Prettier](https://prettier.io/) formatter + IDE extension + [prettier-plugin-gherkin](https://github.com/mapado/prettier-plugin-gherkin?tab=readme-ov-file).

## 1. Install the Prettier plugin

```bash
npm install -D prettier prettier-plugin-gherkin
```

## 2. Add the plugin to the Prettier config

Here is a sample Prettier configuration `prettier.config.mjs`:

```js
export default {
  plugins: ['prettier-plugin-gherkin'],
  // ...
};
```
## 3.Enable auto-formatting in VSCode

Add these lines to `.vscode/settings.json` to apply formatting on save:

```json
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnSave": true,
```

## 4. Edit any feature file and get it auto-formatted

How it works in VS Code:

[auto-formatting](./_media/auto-formatting.mp4 ':include')