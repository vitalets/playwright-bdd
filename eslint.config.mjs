import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import visualComplexity from 'eslint-plugin-visual-complexity';

export default [
  {
    ignores: [
      'examples', // prettier-ignore
      'dist',
      '*.config.js',
      'test/**/.cache',
      '**/.features-gen/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // all files
    files: ['**/*.{js,mjs,ts}'],
    rules: {
      'no-console': 'error',
      'no-undef': 0,
      'no-empty-pattern': 0,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 0,
    },
  },
  {
    // src files
    files: ['src/**/*.{js,mjs,ts}'],
    plugins: {
      visual: visualComplexity,
    },
    rules: {
      complexity: 0,
      'visual/complexity': ['error', { max: 5 }],

      'max-depth': ['error', { max: 2 }],
      'max-nested-callbacks': ['error', { max: 2 }],
      'max-params': ['error', { max: 3 }],
      'max-statements': ['error', { max: 12 }, { ignoreTopLevelFunctions: false }],
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'max-lines': ['error', { max: 200, skipComments: true, skipBlankLines: true }],
      '@typescript-eslint/triple-slash-reference': 0,
      // require is needed for some functions (copied from PW)
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-require-imports': 0,
    },
  },
  {
    // test files
    files: ['test/**/*.{js,mjs,ts}'],
    plugins: {
      playwright,
    },
    rules: {
      'max-params': 0,
      'no-empty-pattern': 0,
      'max-nested-callbacks': 0,
      '@typescript-eslint/no-empty-function': 0,
      'playwright/no-focused-test': 'error',
    },
  },
  {
    files: ['test/special-tag-only/**/*.{js,mjs,cjs,ts}'],
    plugins: {
      playwright,
    },
    rules: {
      'playwright/no-focused-test': 0,
    },
  },
];
