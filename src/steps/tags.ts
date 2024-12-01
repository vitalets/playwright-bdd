import parseTagsExpression from '@cucumber/tag-expressions';
import path from 'node:path';
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
 * Extracts tags from a path.
 * /path/to/@tag1/file.feature -> ['@tag1']
 */
export function extractTagsFromPath(somePath = '') {
  const tags: string[] = [];
  const parts = somePath.split(path.sep);
  parts.forEach((part) => {
    const partTags = part.split(/\s+/).filter((s) => s.length > 1 && s.startsWith('@'));
    tags.push(...partTags);
  });
  return tags;
}
