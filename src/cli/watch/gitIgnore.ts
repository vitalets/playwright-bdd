import fs from 'node:fs';
import type { Stats } from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';
import { isPathInside, toPosixPath } from '../../utils/paths';

export type GitIgnore = {
  filePath: string;
  contents: string;
  exists: boolean;
  matcher: ignore.Ignore | null;
};

export function loadGitIgnore(filePath: string): GitIgnore {
  const exists = fs.existsSync(filePath);
  const contents = exists ? fs.readFileSync(filePath, 'utf8') : '';
  return {
    filePath,
    contents,
    exists,
    matcher: contents ? ignore().add(contents) : null,
  };
}

export function areGitIgnoresEqual(current: GitIgnore[], next: GitIgnore[]) {
  return (
    current.length === next.length &&
    current.every(
      (gitIgnore, index) =>
        gitIgnore.filePath === next[index]?.filePath &&
        gitIgnore.contents === next[index]?.contents &&
        gitIgnore.exists === next[index]?.exists,
    )
  );
}

export function isIgnoredByGitIgnore(gitIgnores: GitIgnore[], absolutePath: string, stats?: Stats) {
  // Ignore files are watcher control files and must stay observable even if a rule matches them.
  if (gitIgnores.some((gitIgnore) => gitIgnore.filePath === absolutePath)) return false;
  return gitIgnores.some((gitIgnore) => isIgnoredByGitIgnoreFile(gitIgnore, absolutePath, stats));
}

function isIgnoredByGitIgnoreFile(gitIgnore: GitIgnore, absolutePath: string, stats?: Stats) {
  if (!gitIgnore.matcher) return false;
  const baseDir = path.dirname(gitIgnore.filePath);
  if (!isPathInside(baseDir, absolutePath)) return false;
  const relativePath = path.relative(baseDir, absolutePath);
  if (!relativePath) return false;
  const pathname = `${toPosixPath(relativePath)}${stats?.isDirectory() ? '/' : ''}`;
  return gitIgnore.matcher.ignores(pathname);
}
