import { type Feature } from '@cucumber/messages';
import { extractTagsFromPath } from '../utils/tagsFromPath';
import { AutofillMap } from '../utils/AutofillMap';
import { GherkinDocumentWithPickles } from './types';

type NewId = () => string;
type TagNode = Feature['tags'][number];

/**
 * Adds tags inferred from feature file paths to the parsed Gherkin model.
 * Cucumber reports read tags from GherkinDocument/Pickle messages, so path tags must be injected
 * there in addition to being used by generated Playwright tests.
 */
export class TagsFromPathInjector {
  constructor(private newId: NewId) {}

  inject(gherkinDocument: GherkinDocumentWithPickles) {
    const { feature, uri } = gherkinDocument;
    if (!feature || !uri) return gherkinDocument;

    const tagsFromPath = extractTagsFromPath(uri);
    if (!tagsFromPath.length) return gherkinDocument;

    const tagNodes = this.injectTagsInFeature(feature, tagsFromPath);
    this.injectTagsInPickles(gherkinDocument, tagNodes);

    return gherkinDocument;
  }

  private injectTagsInFeature(feature: Feature, tagsFromPath: string[]) {
    const tagNodesByName = new AutofillMap<string, TagNode>();
    feature.tags.forEach((tag) => tagNodesByName.set(tag.name, tag));

    const pathTagNames = new Set(tagsFromPath);
    const tagNodes: TagNode[] = [...pathTagNames].map((tagName) => {
      return tagNodesByName.getOrCreate(tagName, () => ({
        id: this.newId(),
        name: tagName,
        location: { line: 1, column: 1 },
      }));
    });

    feature.tags = [...tagNodesByName.values()];
    return tagNodes;
  }

  private injectTagsInPickles(gherkinDocument: GherkinDocumentWithPickles, tagNodes: TagNode[]) {
    gherkinDocument.pickles = gherkinDocument.pickles.map((pickle) => {
      const existingTagNames = new Set(pickle.tags.map((tag) => tag.name));
      const pathTags = tagNodes
        .filter((tagNode) => !existingTagNames.has(tagNode.name))
        .map((tagNode) => ({
          name: tagNode.name,
          astNodeId: tagNode.id,
        }));

      return pathTags.length ? { ...pickle, tags: [...pickle.tags, ...pathTags] } : pickle;
    });
  }
}
