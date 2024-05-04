/**
 * Universal TestNode class representing test or suite in a test file.
 * Holds parent-child links.
 * Allows to inherit tags and titles path.
 */

import { Tag } from '@cucumber/messages';
import { removeDuplicates } from '../utils';
import { SpecialTags } from '../specialTags';

interface GherkinNode {
  name: string;
  tags: readonly Tag[];
}

export class TestNode {
  title: string;
  titlePath: string[];
  ownTags: string[];
  tags: string[];
  specialTags: SpecialTags;

  constructor(gherkinNode: GherkinNode, parent?: TestNode) {
    this.title = gherkinNode.name;
    this.titlePath = (parent?.titlePath || []).concat([this.title]);
    this.ownTags = removeDuplicates(getTagNames(gherkinNode.tags));
    this.tags = removeDuplicates((parent?.tags || []).concat(this.ownTags));
    this.specialTags = new SpecialTags(this.ownTags);
  }

  isSkipped() {
    return this.specialTags.skip || this.specialTags.fixme;
  }
}

function getTagNames(tags: readonly Tag[]) {
  return tags.map((tag) => tag.name);
}
