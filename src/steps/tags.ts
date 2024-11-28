import parseTagsExpression from '@cucumber/tag-expressions';

type Tags = string | undefined;
export type TagsExpression = ReturnType<typeof parseTagsExpression>;

/**
 * Combines several tags strings and build tags expression.
 */
export function buildTagsExpression(defaultTags: Tags, tags: Tags): TagsExpression | undefined {
  const allTags = [defaultTags, tags].filter(Boolean);
  if (allTags.length === 0) return;
  const tagsString = allTags.map((tag) => `(${tag})`).join(' and ');
  return parseTagsExpression(tagsString);
}
