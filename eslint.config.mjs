import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default [
  {
    ignores: ['examples', 'dist', '*.config.js', 'cucumber.js', 'test/**/.cache'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts'],
    // languageOptions: {
    //   parser: tsParser,
    //   parserOptions: {
    //     project: './tsconfig.json',
    //   },
    // },
    // plugins: {
    //   '@typescript-eslint': tsPlugin,
    // },
    rules: {
      // ...tsPlugin.configs.recommended.rules,
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
      '@typescript-eslint/triple-slash-reference': 0,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // require is needed for some functions (copied from PW)
      '@typescript-eslint/no-var-requires': 0,
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
    files: ['test/special-tag-only/**'],
    plugins: {
      playwright,
    },
    rules: {
      'playwright/no-focused-test': 0,
    },
  },
  {
    files: ['test/cjs/**'],
    rules: {
      '@typescript-eslint/no-var-requires': 0,
    },
  },
];
