/**
 * Universal TestNode class of parent-child relations in test file structure.
 * Holds tags and titles path.
 */

import { Tag } from '@cucumber/messages';
import { removeDuplicates } from '../utils';

const SPECIAL_TAGS = ['@only', '@skip', '@fixme'] as const;
type SpecialTag = (typeof SPECIAL_TAGS)[number];

interface GherkinNode {
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

  constructor(gherkinNode: GherkinNode, parent?: TestNode) {
    this.initOwnTags(gherkinNode);
    this.tags = removeDuplicates((parent?.tags || []).concat(this.ownTags));
    this.title = gherkinNode.name;
    this.titlePath = (parent?.titlePath || []).concat([this.title]);
  }

  isSkipped() {
    return this.flags.skip || this.flags.fixme;
  }

  private initOwnTags(gherkinNode: GherkinNode) {
    const tagNames = removeDuplicates(getTagNames(gherkinNode.tags));
    tagNames.forEach((tag) => {
      if (isSpecialTag(tag)) {
        this.setFlag(tag);
      } else {
        this.ownTags.push(tag);
      }
    });
  }

  // eslint-disable-next-line complexity
  private setFlag(tag: SpecialTag) {
    // in case of several system tags, @only takes precendence
    if (tag === '@only') this.flags = { only: true };
    if (tag === '@skip' && !this.flags.only) this.flags.skip = true;
    if (tag === '@fixme' && !this.flags.only) this.flags.fixme = true;
  }
}

function getTagNames(tags: readonly Tag[]) {
  return tags.map((tag) => tag.name);
}

function isSpecialTag(tag: string): tag is SpecialTag {
  return SPECIAL_TAGS.includes(tag as SpecialTag);
}
