/**
 * Formats a Cucumber messages array as a human-readable string:
 *
 *   Scenario: my scenario [attempt 0]
 *     PASS setup all
 *     PASS a step that passes
 *   Scenario: my scenario [attempt 1]
 *     ...
 */
const STATUS_ABBR = { PASSED: 'PASS', FAILED: 'FAIL', SKIPPED: 'SKIP' };
export function formatMessagesReport(messages) {
  const hookNames = new Map(messages.filter((m) => m.hook).map((m) => [m.hook.id, m.hook.name]));

  const pickleNames = new Map(
    messages.filter((m) => m.pickle).map((m) => [m.pickle.id, m.pickle.name]),
  );

  const pickleStepTexts = new Map(
    messages.filter((m) => m.pickle).flatMap((m) => m.pickle.steps.map((s) => [s.id, s.text])),
  );

  const testCasePickleIds = new Map(
    messages.filter((m) => m.testCase).map((m) => [m.testCase.id, m.testCase.pickleId]),
  );

  const testStepNames = new Map(
    messages
      .filter((m) => m.testCase)
      .flatMap((m) =>
        m.testCase.testSteps.map((s) => [
          s.id,
          s.hookId ? hookNames.get(s.hookId) : pickleStepTexts.get(s.pickleStepId),
        ]),
      ),
  );

  const stepsByRun = new Map();
  messages
    .filter((m) => m.testStepFinished)
    .forEach(({ testStepFinished: { testCaseStartedId, testStepId, testStepResult } }) => {
      if (!stepsByRun.has(testCaseStartedId)) stepsByRun.set(testCaseStartedId, []);
      stepsByRun.get(testCaseStartedId).push({ testStepId, status: testStepResult.status });
    });

  const lines = [];
  messages
    .filter((m) => m.testCaseStarted)
    .forEach(({ testCaseStarted: { id, testCaseId, attempt } }) => {
      const scenarioName = pickleNames.get(testCasePickleIds.get(testCaseId));
      lines.push(`Scenario: ${scenarioName} [attempt ${attempt}]`);
      (stepsByRun.get(id) || []).forEach(({ testStepId, status }) => {
        lines.push(`  ${STATUS_ABBR[status] ?? status} ${testStepNames.get(testStepId)}`);
      });
    });

  return lines.join('\n');
}
