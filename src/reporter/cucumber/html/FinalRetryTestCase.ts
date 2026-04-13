import * as messages from '@cucumber/messages';
import { TestCaseRun } from '../messagesBuilder/TestCaseRun';

/**
 * Builds the HTML-specific testCase envelope for the final non-retried attempt of a scenario.
 * It reuses canonical TestCase step IDs but filters hook steps to only those executed in this run.
 */
export class FinalRetryTestCase {
  readonly testCaseId: string;
  readonly testCaseRunId: string;
  readonly testStepIds: Set<string>;
  readonly envelope: messages.Envelope;
  private testCase: ReturnType<TestCaseRun['getTestCase']>;

  constructor(
    private testCaseRun: TestCaseRun,
    testRunStartedId: string,
  ) {
    this.testCaseRun = testCaseRun;
    this.testCase = testCaseRun.getTestCase();
    const testSteps = [
      ...this.getRunHookSteps('before'),
      ...this.testCase.getSteps(),
      ...this.getRunHookSteps('after'),
    ];

    this.testCaseId = this.testCase.id;
    this.testCaseRunId = testCaseRun.id;
    this.testStepIds = new Set(testSteps.map(({ id }) => id));
    this.envelope = {
      testCase: {
        testRunStartedId,
        id: this.testCase.id,
        pickleId: this.testCase.pickle.id,
        testSteps,
      },
    };
  }

  /**
   * Returns hook test steps for the given hook type, filtered to only those that were actually
   * executed in this run. Hooks accumulated on the shared TestCase may include hooks from
   * previous retries that did not run in the final attempt (e.g. a BeforeAll that only ran once),
   * so we intersect with the executed hooks of this specific TestCaseRun.
   */
  private getRunHookSteps(hookType: 'before' | 'after') {
    return Array.from(this.testCase.getHooks(hookType).entries())
      .filter(([internalId]) => this.testCaseRun.getExecutedHooks(hookType).has(internalId))
      .map(([, { testStep }]) => testStep);
  }
}
