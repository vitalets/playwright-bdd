/**
 * Handling cucumber tags.
 */
import { Scenario, Feature, Rule, Examples, Tag } from '@cucumber/messages';
import { Flags } from './formatter';

const SPECIAL_TAGS_NAMES = ['@only', '@skip', '@fixme'] as const;
const SPECIAL_TAGS = new Map<string, (typeof SPECIAL_TAGS_NAMES)[number]>(
  SPECIAL_TAGS_NAMES.map((v) => [v, v]),
);

export const TEST_KEY_SEPARATOR = '|';

type TestTitleKey = string;
type TagName = string;

export class TestFileTags {
  tagsMap = new Map<TestTitleKey, TagName[]>();

  registerTestTags(
    parents: (Feature | Rule | Scenario)[],
    testTitle: string,
    testTags: readonly Tag[],
  ) {
    const tags = this.getTestTags(parents, testTags);
    if (tags.length > 0) {
      const key = this.getTestKey(parents, testTitle);
      this.addTestTags(key, tags);
    }
    return tags;
  }

  private getTestTags(parents: (Feature | Rule | Scenario)[], testTags: readonly Tag[]) {
    const tagNames = new Set<string>();
    parents
      .map((p) => p.tags)
      .concat([testTags])
      .forEach((tags) => {
        tags
          // filter out special tags
          .filter((tag) => !SPECIAL_TAGS.has(tag.name))
          .forEach((tag) => tagNames.add(tag.name));
      });

    return [...tagNames];
  }

  private getTestKey(parents: (Feature | Rule | Scenario)[], testTitle: string) {
    return parents
      .slice(1) // remove first parent as it is the same for all tests
      .map((p) => p.name)
      .concat([testTitle])
      .join(TEST_KEY_SEPARATOR);
  }

  private addTestTags(key: string, tags: string[]) {
    if (this.tagsMap.has(key)) {
      throw new Error(`Duplicate test title path: "${key}"`);
    }
    this.tagsMap.set(key, tags);
  }
}

export function getFormatterFlags(item: Feature | Rule | Scenario | Examples) {
  const flags: Flags = {};
  item.tags.forEach((tag) => {
    const specialName = SPECIAL_TAGS.get(tag.name);
    if (specialName === '@only') flags.only = true;
    if (specialName === '@skip') flags.skip = true;
    if (specialName === '@fixme') flags.fixme = true;
  });
  return flags;
}
