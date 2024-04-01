/**
 * Fields config for MESSAGE report shape comparison
 */
import { toPosixPath } from '../_helpers/index.mjs';

export const messageReportFields = {
  ignorePaths: [
    // in playwright-bdd we add only named hooks, so ignore hook.name from comparison
    'hook.name',
    // Cucumber does not log hook location column, but playwright-bdd does
    'hook.sourceReference.location.column',
    // hook.tagExpression is not supported by playwright-bdd (yet)
    'hook.tagExpression',
    // stepDefinition messages are not supported (yet)
    'stepDefinition',
    'testCase.testSteps.#.stepDefinitionIds',
    // Playwright attachments always have name
    'attachment.fileName',
  ],

  // these paths are compared by values, not by total counter.
  valuePaths: [
    'source.uri', // prettier-ignore
    'gherkinDocument.uri',
    'pickle.uri',
    'pickle.name', // prettier-ignore
    'pickle.tags.#.name',
    'pickle.steps.#.text',
    'attachment.mediaType',
    'testCaseStarted.attempt',
    'testStepFinished.testStepResult.status',
    'testRunFinished.success',
  ],

  transform: (key, value) => (key.endsWith('uri') ? toPosixPath(value) : value),
};
