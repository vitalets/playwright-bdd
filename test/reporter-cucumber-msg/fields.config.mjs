/**
 * Fields config for comparison.
 */

// fields config for MESSAGE report shape comparison
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

  // these paths are compared by values, not by counter.
  valuePaths: [
    'source.data', // prettier-ignore
    'pickle.name',
    'pickle.steps.#.text',
    'attachment.mediaType',
    'testCaseStarted.attempt',
  ],
};

// fields config for JSON report shape comparison
export const jsonReportFields = {
  ignorePaths: [
    // ignored b/c there is no stepDefinitions (yet)
    // See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts#L279
    'elements.#.steps.#.match.location',
  ],

  // these paths are compared by values, not by counter.
  valuePaths: [
    'name', // prettier-ignore
    'elements.#.steps.#.result.status',
    'elements.#.steps.#.name',
  ],
};
