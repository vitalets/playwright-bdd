/**
 * Creates gherkin document copy with re-generated ast node IDs,
 * pickle IDs and pickle steps IDs.
 */
import { randomUUID } from 'node:crypto';
import { GherkinDocumentWithPickles, PickleWithLocation } from '../../../features/load.js';
import { AutofillMap } from '../../../utils/AutofillMap.js';

export class GherkinDocumentClone {
  private oldNewIds = new AutofillMap<string, string>();
  constructor(private gherkinDocument: GherkinDocumentWithPickles) {}

  getClone() {
    const copiedDoc = this.getDocumentCopyWithNewIds();
    this.remapPickleAstNodeIds(copiedDoc);
    return copiedDoc;
  }

  private getDocumentCopyWithNewIds() {
    return JSON.parse(
      JSON.stringify(this.gherkinDocument, (key, value) => {
        return key === 'id' ? this.getOrGenerateNewId(value) : value;
      }),
    ) as GherkinDocumentWithPickles;
  }

  private remapPickleAstNodeIds(copiedDoc: GherkinDocumentWithPickles) {
    copiedDoc.pickles.forEach((pickle) => {
      pickle.astNodeIds = pickle.astNodeIds.map((oldId) => this.getNewId(oldId));
      this.remapPickleStepsAstNodeIds(pickle);
    });
  }

  private remapPickleStepsAstNodeIds(pickle: PickleWithLocation) {
    pickle.steps.forEach((step) => {
      step.astNodeIds = step.astNodeIds.map((oldId) => this.getNewId(oldId));
    });
  }

  private getOrGenerateNewId(oldId: string) {
    return this.oldNewIds.getOrCreate(oldId, () => randomUUID());
  }

  private getNewId(oldId: string) {
    const newId = this.oldNewIds.get(oldId);
    if (!newId) throw new Error(`New ID is not found for old ID: ${oldId}`);
    return newId;
  }
}
