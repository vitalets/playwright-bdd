module.exports = {
  '**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write --ignore-unknown',
    (files) => (files.length ? 'cross-env FORBID_ONLY=1 npm test' : ''),
  ],
  '!(**/*.{js,ts})': 'prettier --write --ignore-unknown',
};
