/**
 * Universal TestNode class representing test or suite in a test file.
 * Holds parent-child links.
 * Allows to inherit tags and titles path.
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
  ownTags: string[];
  tags: string[];
  flags: TestNodeFlags = {};

  constructor(gherkinNode: GherkinNode, parent?: TestNode) {
    this.title = gherkinNode.name;
    this.titlePath = (parent?.titlePath || []).concat([this.title]);
    this.ownTags = removeDuplicates(getTagNames(gherkinNode.tags));
    this.tags = removeDuplicates((parent?.tags || []).concat(this.ownTags));
    this.initFlags();
  }

  isSkipped() {
    return this.flags.skip || this.flags.fixme;
  }

  private initFlags() {
    this.ownTags.forEach((tag) => {
      if (isSpecialTag(tag)) this.setFlag(tag);
    });
  }

  // eslint-disable-next-line complexity
  private setFlag(tag: SpecialTag) {
    // in case of several special tags, @only takes precendence
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
