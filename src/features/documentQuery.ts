/**
 * Helper to query data from loaded gherkin document.
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles } from './load';

export class GherkinDocumentQuery {
  // Map pickle step to scenario step.
  // One scenario step can be used in several pickles:
  // - steps from background are used in several pickles
  // - steps from scenario outline are used in several pickles
  // private pickleStepToScenarioStep = new Map<string /* pickleStep.id */, messages.Step>();

  constructor(private gherkinDocument: GherkinDocumentWithPickles) {}

  get pickles() {
    return this.gherkinDocument.pickles;
  }

  hasPickles() {
    return this.pickles.length > 0;
  }

  /**
   * Returns pickle for scenario.
   * Pickle is executable entity including background steps
   * and steps titles with substituted example values.
   */
  findPickle(scenario: messages.Scenario, exampleRow?: messages.TableRow) {
    const pickle = this.pickles.find((pickle) => {
      const hasScenarioId = pickle.astNodeIds.includes(scenario.id);
      const hasExampleRowId = !exampleRow || pickle.astNodeIds.includes(exampleRow.id);
      return hasScenarioId && hasExampleRowId;
    });

    if (!pickle) {
      throw new Error(`Pickle not found for scenario: ${scenario.name}`);
    }

    return pickle;
  }

  /**
   * Returns pickleStep for ast step.
   *
   * Note:
   * When searching for pickleStep iterate all pickles in a file
   * b/c for background steps there is no own pickle.
   * This can be optimized: pass optional 'pickle' parameter
   * and search only inside it if it passed (for bg pickle will be omitted).
   * But this increases code complexity, and performance impact seems to be minimal
   * b/c number of pickles inside feature file is not very big.
   */
  findPickleStep(step: messages.Step, exampleRowId?: string) {
    for (const pickle of this.pickles) {
      const pickleStep = pickle.steps.find(({ astNodeIds }) => {
        const hasStepId = astNodeIds.includes(step.id);
        const hasRowId = !exampleRowId || astNodeIds.includes(exampleRowId);
        return hasStepId && hasRowId;
      });

      if (pickleStep) {
        return pickleStep;
      }
    }

    throw new Error(`Pickle step not found for scenario step: ${step.text}`);
  }

  /**
   * Gets scenario / bg step for pickle step (from map).
   */
  // findScenarioStep(pickleStep: messages.PickleStep) {
  //   const step = this.pickleStepToScenarioStep.get(pickleStep.id);
  //   if (!step) {
  //     // this should not happen
  //     throw new Error(
  //       `Scenario step not found for pickle step:${pickleStep.id} ${pickleStep.text}`,
  //     );
  //   }
  //   return step;
  // }
}
