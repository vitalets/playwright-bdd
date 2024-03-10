const globals = require('globals');
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const playwright = require('eslint-plugin-playwright');

module.exports = [
  {
    ignores: ['examples', 'dist', '*.config.js', 'cucumber.js', 'test/**/.cache'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
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
      'max-statements': ['error', { max: 12 }, { ignoreTopLevelFunctions: false }],
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'max-lines': ['error', { max: 200, skipComments: true, skipBlankLines: true }],
      semi: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/triple-slash-reference': 0,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 0,
      'no-empty-pattern': 0,
    },
  },
  {
    files: ['test/**/*.{ts,js,mjs}'],
    plugins: {
      playwright,
    },
    rules: {
      'max-params': 0,
      'no-empty-pattern': 0,
      '@typescript-eslint/no-empty-function': 0,
      'playwright/no-focused-test': 'error',
    },
  },
  {
    files: ['test/**/only-skip-fixme.feature.spec.js', 'test/**/minimal.feature.spec.js'],
    plugins: {
      playwright,
    },
    rules: {
      'playwright/no-focused-test': 0,
    },
  },
];
