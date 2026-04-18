/**
 * Fetches stable @playwright/test versions from npm and outputs a JSON array
 * of unique major.minor versions above the given minimum, or only the latest.
 * Excludes any pre-release versions (beta, rc, alpha).
 *
 * Examples:
 * node scripts/get-pw-versions.ts 1.45
 * node scripts/get-pw-versions.ts latest
 * node scripts/get-pw-versions.ts beta
 */
const { execSync } = require('node:child_process') as typeof import('node:child_process');

const sinceVersion = process.argv[2];
const logger = console;

if (!sinceVersion) {
  logger.error('Usage: node scripts/get-pw-versions.ts <major.minor|"latest"|"beta">');
  process.exit(1);
}

type VersionInfo = { raw: string; major: number; minor: number };

const rawVersions = getRawVersions();
const stableVersions = getStableVersions(rawVersions);
const lastBetaVersion = getLastBetaVersion(rawVersions);
// Playwright 'beta' releases a few days before the stable release.
// But after the release, 'beta' is outdated for some time -> don't include it in the list.
const hasRealBeta = isRealBetaVersion(stableVersions, lastBetaVersion);
const outputVersions = getOutputVersions(stableVersions, hasRealBeta);
logger.log(JSON.stringify(outputVersions));

function getOutputVersions(stableVersions: VersionInfo[], hasRealBeta?: boolean): string[] {
  const sortedStableVersions = [...stableVersions].sort(acsendingSorter);

  if (sinceVersion === 'beta') {
    return hasRealBeta ? ['beta'] : [];
  }

  const outputVersions =
    sinceVersion === 'latest' ? ['latest'] : getVersionsSince(sortedStableVersions, sinceVersion);

  if (hasRealBeta) outputVersions.push('beta');

  return [...new Set(outputVersions)];
}

function getRawVersions(): string[] {
  const cmdOutput = execSync('npm view @playwright/test versions --json', { encoding: 'utf8' });
  return JSON.parse(cmdOutput) as string[];
}

function getStableVersions(rawVersions: string[]): VersionInfo[] {
  return rawVersions.filter(isStableVersion).map(parseVersion);
}

function getLastBetaVersion(rawVersions: string[]): VersionInfo | undefined {
  const lastBetaVersion = rawVersions.findLast((v) => v.includes('beta'));
  return lastBetaVersion ? parseVersion(lastBetaVersion) : undefined;
}

function isRealBetaVersion(
  stableVersions: VersionInfo[],
  lastBetaVersion: VersionInfo | undefined,
): boolean {
  return (
    !!lastBetaVersion &&
    !stableVersions.find(
      (v) => v.major === lastBetaVersion.major && v.minor === lastBetaVersion.minor,
    )
  );
}

function isStableVersion(version: string): boolean {
  // Exclude pre-release versions (e.g. 1.59.0-beta-1774995564000")
  return !version.includes('-');
}

function getVersionsSince(stableVersions: VersionInfo[], sinceVersionRaw: string): string[] {
  const sinceV = parseVersion(sinceVersionRaw);
  return stableVersions.filter((v) => isVersionSince(v, sinceV)).map(stringifyVersion);
}

function isVersionSince(version: VersionInfo, sinceVersion: VersionInfo): boolean {
  return (
    version.major > sinceVersion.major ||
    (version.major === sinceVersion.major && version.minor >= sinceVersion.minor)
  );
}

function acsendingSorter(a: VersionInfo, b: VersionInfo): number {
  return a.major === b.major ? a.minor - b.minor : a.major - b.major;
}

function parseVersion(raw: string): VersionInfo {
  const [major, minor] = raw.split('.').map(Number);
  return { raw, major, minor };
}

function stringifyVersion({ major, minor }: VersionInfo): string {
  return `${major}.${minor}`;
}
