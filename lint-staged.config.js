module.exports = {
  '**/*.{js,mjs,ts}': [
    'eslint --fix --no-warn-ignored',
    'prettier --write --ignore-unknown',
    () => 'npm test',
  ],
  '**/*.feature': 'node scripts/no-only-in-features.mjs',
  'docs/**': () => 'npm run docs:validate',
  '!(**/*.{js,mjs,ts,feature})': 'prettier --write --ignore-unknown',
};
