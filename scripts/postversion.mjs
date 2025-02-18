/**
 * Postversion script for updating CHANGELOG.md
 *
 * This script runs automatically after `npm version` and does the following:
 * - Checks if the new version follows the `x.x.x` format (ignores pre-releases).
 * - Updates `CHANGELOG.md`, replacing "## Dev" with the new version.
 * - Warns if "## Dev" is missing but does not modify the file.
 * - Amends the Git commit to include the updated changelog.
 */

import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

const PACKSGE_JSON_PATH = 'package.json';
const CHANGELOG_PATH = 'CHANGELOG.md';
const VERSION_PLACEHOLDER = '## Dev';

const logger = console;

// Run the update function
updateChangelog();

async function updateChangelog() {
  // Read package.json and parse it as JSON
  const packageJsonContent = await readFile(PACKSGE_JSON_PATH, 'utf8');
  const newVersion = JSON.parse(packageJsonContent).version;

  // Regex to match versions like x.x.x and exclude pre-release, pre-minor, and pre-patch versions
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    logger.log(`Skipping CHANGELOG.md update for non-stable version (${newVersion}).`);
    process.exit(0);
  }

  // Read CHANGELOG.md
  let changelogContent = await readFile(CHANGELOG_PATH, 'utf8');

  // Check if "## Dev" exists
  if (!changelogContent.includes(VERSION_PLACEHOLDER)) {
    logger.warn(`⚠️ WARNING: "${VERSION_PLACEHOLDER}" not found in CHANGELOG.md. Skipping update.`);
    process.exit(0);
  }

  // Replace "## Dev" with the new version
  const updatedChangelog = changelogContent.replace(VERSION_PLACEHOLDER, `## ${newVersion}`);

  // Write the updated changelog
  await writeFile(CHANGELOG_PATH, updatedChangelog, 'utf8');

  // Commit the changes (added to commit of npm version)
  execSync('git add CHANGELOG.md');
  execSync('git commit --amend --no-edit');

  logger.log(`✅ Updated CHANGELOG.md with new version: ${newVersion}`);
}
