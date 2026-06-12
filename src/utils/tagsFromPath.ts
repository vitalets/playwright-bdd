import path from 'node:path';
import { belongsToNodeModules } from './paths';

/**
 * Extracts all '@'-prefixed tags from a given file path.
 *
 * Example:
 * 'features/@foo-bar/@baz.ts' -> ['@foo-bar', '@baz']
 */
export function extractTagsFromPath(filePath: string) {
  const tags: string[] = [];
  if (!belongsToNodeModules(filePath)) {
    // for filename take first part before dot to omit extension and sub-extension.
    const fileNamePart = path.basename(filePath).split('.')[0] || '';
    const dirParts = path.dirname(filePath).split(path.sep);
    [...dirParts, fileNamePart].forEach((part) => {
      // consider any @-prefixed symbols as tag
      const partTags = part.match(/@[^@\s]+/g) || [];
      tags.push(...partTags);
    });
  }
  return tags;
}
