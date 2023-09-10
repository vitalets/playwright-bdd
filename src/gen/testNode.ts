/**
 * Universal TestNode class of parent-child relations in test file structure.
 * Holds tags and titiles path.
 */

import { Tag } from '@cucumber/messages';
import { removeDuplicates } from '../utils';

const SPECIAL_TAGS = ['@only', '@skip', '@fixme'] as const;
type SpecialTag = (typeof SPECIAL_TAGS)[number];

interface TestNodeOriginalItem {
  name: string;
  tags: readonly Tag[];
}

type TestNodeFlags = {
  only?: boolean;
  skip?: boolean;
  fixme?: boolean;
};

export class TestNode {
  title: string;
  titlePath: string[];
  ownTags: string[] = [];
  tags: string[] = [];
  flags: TestNodeFlags = {};

  constructor(origItem: TestNodeOriginalItem, parent?: TestNode) {
    this.initOwnTags(origItem);
    this.tags = removeDuplicates((parent?.tags || []).concat(this.ownTags));
    this.title = origItem.name;
    this.titlePath = (parent?.titlePath || []).concat([this.title]);
  }

  private initOwnTags(origItem: TestNodeOriginalItem) {
    const tagNames = removeDuplicates(getTagNames(origItem.tags));
    tagNames.forEach((tag) => {
      if (isSpecialTag(tag)) {
        this.setFlag(tag);
      } else {
        this.ownTags.push(tag);
      }
    });
  }

  private setFlag(tag: SpecialTag) {
    if (tag === '@only') this.flags.only = true;
    if (tag === '@skip') this.flags.skip = true;
    if (tag === '@fixme') this.flags.fixme = true;
  }
}

function getTagNames(tags: readonly Tag[]) {
  return tags.map((tag) => tag.name);
}

function isSpecialTag(tag: string): tag is SpecialTag {
  return SPECIAL_TAGS.includes(tag as SpecialTag);
}
