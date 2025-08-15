import parseTagsExpression from '@cucumber/tag-expressions';
import { removeDuplicates } from '../utils';
import { belongsToNodeModules } from '../utils/paths';
import path from 'node:path';

type TagString = string | undefined;
export type TagsExpression = ReturnType<typeof parseTagsExpression>;

/**
 * Combines several tags strings and build tags expression.
 */
export function buildTagsExpression(tagStrings: TagString[]): TagsExpression | undefined {
  tagStrings = removeDuplicates(tagStrings.filter(Boolean));
  if (tagStrings.length === 0) return;
  const joinedTagString = tagStrings.map((tag) => `(${tag})`).join(' and ');
  return parseTagsExpression(joinedTagString);
}

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
