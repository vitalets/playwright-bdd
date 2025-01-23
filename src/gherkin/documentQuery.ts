/**
 * Helper to query data from loaded gherkin document.
 * See PICKLES.md.
 */

/* eslint-disable max-nested-callbacks */

import * as messages from '@cucumber/messages';
import { AutofillMap } from '../utils/AutofillMap';
import { GherkinDocumentWithPickles, PickleWithLocation } from './types';

export class GherkinDocumentQuery {
  private astNodeIdsToPickles = new AutofillMap<string, PickleWithLocation[]>();
  private astNodeIdsToPickleSteps = new AutofillMap<string, messages.PickleStep[]>();

  constructor(private gherkinDocument: GherkinDocumentWithPickles) {
    // Here, we could recursively iterate whole document
    // and map astNodeIds to actual steps / example rows,
    // to be able to quickly find ast step for pickle step astNodeIds.
    // But actually we already iterate whole document in testFile,
    // for now we just iterate pickles and build reverse map.
    this.mapAstNodeIdsToPickles();
    this.mapAstNodeIdsToPickleSteps();
  }

  get pickles() {
    return this.gherkinDocument.pickles;
  }

  hasPickles() {
    return this.pickles.length > 0;
  }

  // todo: returns strictly one pickle step!
  // getPickleStep(scenarioId: string, stepId: string, exampleRowId: string) {
  //   return null;
  // }

  /**
   * Returns pickle for astNodeId.
   * Pickle is executable entity including background steps
   * and steps titles with substituted example values.
   *
   * AstNodeId can represent here:
   * - bg scenario: maps to several pickles
   * - scenario: maps to single pickle
   * - scenario outline: maps to several pickles (for each example row)
   * - example row: maps to single pickle
   */
  getPickles(astNodeId: string) {
    return this.astNodeIdsToPickles.get(astNodeId) || [];
  }

  /**
   * Returns pickle steps for AstNodeId.
   * AstNodeId can represent here:
   * - bg step: maps to several pickle steps (in different pickles)
   * - scenario step: maps to single pickle step
   * - scenario outline step: maps to several pickle steps (for each example row)
   * - example row: maps to several pickle steps (for each scenario step)
   */
  getPickleSteps(astNodeId: string) {
    return this.astNodeIdsToPickleSteps.get(astNodeId) || [];
  }

  private mapAstNodeIdsToPickles() {
    this.pickles.forEach((pickle) => {
      pickle.astNodeIds.forEach((astNodeId) => {
        this.astNodeIdsToPickles.getOrCreate(astNodeId, () => []).push(pickle);
      });
    });
  }

  private mapAstNodeIdsToPickleSteps() {
    this.pickles.forEach((pickle) => {
      pickle.steps.forEach((pickleStep) => {
        pickleStep.astNodeIds.forEach((astNodeId) => {
          this.astNodeIdsToPickleSteps.getOrCreate(astNodeId, () => []).push(pickleStep);
        });
      });
    });
  }
}
