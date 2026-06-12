import { parse as parseTagsExpression } from '@cucumber/tag-expressions';
import { removeDuplicates } from '../utils';
export { extractTagsFromPath } from '../utils/tagsFromPath';

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
