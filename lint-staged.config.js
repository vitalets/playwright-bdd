module.exports = {
  '**/*.{js,mjs,ts}': [
    'eslint --fix',
    'prettier --write --ignore-unknown',
    () => 'cross-env FORBID_ONLY=1 npm test',
  ],
  '!(**/*.{js,mjs,ts})': 'prettier --write --ignore-unknown',
};
