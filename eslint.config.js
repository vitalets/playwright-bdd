const globals = require('globals');
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['examples', 'dist', '*.config.js', 'cucumber.js', 'test/**/*.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      'no-console': 'error',

      complexity: ['error', { max: 5 }],
      'max-depth': ['error', { max: 2 }],
      'max-nested-callbacks': ['error', { max: 2 }],
      'max-params': ['error', { max: 3 }],
      'max-statements': [
        'error',
        { max: 12 },
        { ignoreTopLevelFunctions: false },
      ],
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'max-lines': [
        'error',
        { max: 150, skipComments: true, skipBlankLines: true },
      ],
      semi: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/triple-slash-reference': 0,
      'no-undef': 0,
    },
  },
];
