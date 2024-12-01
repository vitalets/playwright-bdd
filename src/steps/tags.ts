import parseTagsExpression from '@cucumber/tag-expressions';
import { removeDuplicates } from '../utils';

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
 * @param {string} path - The file path from which to extract tags.
 * @returns {string[]} An array of tags found in the path.
 *
 * The function uses a regular expression to match tags that start with an '@' symbol
 * and are followed by any characters except for specific delimiters. The delimiters
 * that signal the end of a tag are:
 * - '@': Indicates the start of a new tag.
 * - '/': Forward slash, used in file paths.
 * - '\\': Backslash, used in Windows file paths.
 * - Whitespace characters (spaces, tabs, etc.).
 * - ',': Comma, used to separate tags.
 * - '.': Dot, used in file extensions.
 *
 * This allows tags to include a wide range of characters, including symbols like ':', '-',
 * and others, while ensuring they are properly extracted from the path.
 *
 * **Example Usage:**
 * ```typescript
 * extractTagsFromPath('features/@foo-bar/@baz:qux');
 * // Returns: ['@foo-bar', '@baz:qux']
 * ```
 */
export function extractTagsFromPath(path: string): string[] {
  const regex = /@[^@/\\\s,.]+/g;
  return path.match(regex) || [];
}
