// Check that there are no @only tags in feature files
// Example:
// node scripts/no-only-in-features.mjs test/**/*.feature
import fs from 'node:fs';

const files = process.argv.slice(2);
const skipFiles = ['only-feature.feature', 'only-scenario.feature'];

files.forEach((filePath) => {
  if (skipFiles.some((skipFile) => filePath.endsWith(skipFile))) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('@only')) {
    // eslint-disable-next-line no-console
    console.log('Unexpected @only in:', filePath);
    process.exit(1);
  }
});
