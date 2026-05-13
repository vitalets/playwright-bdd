/**
 * Finalizes CHANGELOG.md for a release: stamps the [Unreleased] section with
 * the given version and today's date, refreshes compare links at the bottom,
 * opens a fresh [Unreleased] section above it, and prints the release notes to
 * stdout for use in CI (e.g. GitHub Release body).
 *
 * Usage:
 *   node scripts/changelog.mts <version>
 */
import fs from 'node:fs';

const CHANGELOG_PATH = 'CHANGELOG.md';
const PACKAGE_JSON_PATH = 'package.json';
const logger = console;

const version = process.argv[2];

main();

/** Updates the changelog for the requested release version. */
function main() {
  if (!version) {
    logger.error('Usage: changelog.ts <version>');
    process.exit(1);
  }

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const repositoryUrl = getRepositoryUrl();
  const newContent = updateCompareLinks(stampChangelog(content, version), repositoryUrl);
  fs.writeFileSync(CHANGELOG_PATH, newContent);
  const releaseNotes = extractReleaseNotes(newContent, version);
  logger.log(releaseNotes);
}

/** Converts the Unreleased section into a dated release section. */
function stampChangelog(text: string, version: string) {
  const date = new Date().toISOString().slice(0, 10);
  const updated = text.replace('## [Unreleased]', `## [Unreleased]\n\n## [${version}] - ${date}`);
  if (updated === text) {
    logger.error('Could not find "## [Unreleased]" section in CHANGELOG.md');
    process.exit(1);
  }
  return updated;
}

/** Reads the section body for a released version. */
function extractReleaseNotes(text: string, version: string) {
  const lines = text.split('\n');
  const headingIndex = lines.findIndex((l) => l.startsWith(`## [${version}]`));
  const bodyLines = [];
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (lines[i]?.startsWith('## ')) break;
    bodyLines.push(lines[i]);
  }
  return bodyLines.join('\n').trim();
}

/** Refreshes Keep a Changelog link references at the end of the file. */
function updateCompareLinks(text: string, repositoryUrl: string) {
  const versions = extractReleasedVersions(text);
  const lines = removeCompareLinks(text).split('\n');
  trimTrailingEmptyLines(lines);

  if (versions.length === 0) {
    return `${lines.join('\n')}\n`;
  }

  lines.push('', ...buildCompareLinks(versions, repositoryUrl));
  return `${lines.join('\n')}\n`;
}

/** Extracts released version numbers from changelog headings. */
function extractReleasedVersions(text: string) {
  return text
    .split('\n')
    .map((line) => line.match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}$/)?.[1])
    .filter((version): version is string => Boolean(version));
}

/** Removes the existing changelog link reference block. */
function removeCompareLinks(text: string) {
  const lines = text.split('\n');
  const compareLinksStartIndex = lines.findIndex((line) => /^\[unreleased\]: /i.test(line));
  return compareLinksStartIndex === -1 ? text : lines.slice(0, compareLinksStartIndex).join('\n');
}

/** Builds link references for Unreleased and every released version. */
function buildCompareLinks(versions: string[], repositoryUrl: string) {
  return [
    `[unreleased]: ${repositoryUrl}/compare/v${versions[0]}...HEAD`,
    ...versions.map((version, index) =>
      buildVersionCompareLink(versions, repositoryUrl, version, index),
    ),
  ];
}

/** Builds a tag or compare link reference for a released version. */
function buildVersionCompareLink(
  versions: string[],
  repositoryUrl: string,
  version: string,
  index: number,
) {
  const previousVersion = versions[index + 1];
  const url = previousVersion
    ? `${repositoryUrl}/compare/v${previousVersion}...v${version}`
    : `${repositoryUrl}/releases/tag/v${version}`;
  return `[${version}]: ${url}`;
}

/** Removes blank lines from the end of a line array. */
function trimTrailingEmptyLines(lines: string[]) {
  while (lines.at(-1) === '') {
    lines.pop();
  }
}

/** Reads and normalizes the GitHub repository URL from package.json. */
function getRepositoryUrl() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8')) as {
    repository?: { url?: string } | string;
  };
  const repository =
    typeof packageJson.repository === 'string'
      ? packageJson.repository
      : packageJson.repository?.url;
  const normalized = repository
    ?.replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');
  const match = normalized?.match(/github\.com[:/](.+)$/);
  if (!match) {
    logger.error('Could not determine GitHub repository URL from package.json');
    process.exit(1);
  }
  return `https://github.com/${match[1]}`;
}
