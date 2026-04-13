/**
 * Transforms the envelope set consumed by the HTML formatter.
 *
 * Cucumber HTML renders only the final non-retried attempt for a scenario. This transformer
 * builds a dedicated finalRetryTestCase for that HTML view, replacing the shared TestCase envelopes
 * while dropping retried attempts and step envelopes that no longer belong to the final retry.
 */
import * as messages from '@cucumber/messages';
import { MessagesBuilder } from '../messagesBuilder';
import { FinalRetryTestCase } from './FinalRetryTestCase';

export class EnvelopesTransformer {
  private finalRetryTestCases = new Map</* testCaseId */ string, messages.Envelope>();
  private finalRetryTestCaseRunIds = new Set</* testCaseRunId */ string>();
  private finalRetryTestStepIdsByRunId = new Map</* testCaseRunId */ string, Set<string>>();

  constructor(private messagesBuilder: MessagesBuilder) {
    this.buildFinalRetryTestCases();
  }

  /**
   * Build HTML-specific test cases for the final non-retried attempts.
   * They reuse the canonical TestCase step IDs so step envelopes emitted for the final retry
   * continue to match after hook steps are filtered out.
   */
  private buildFinalRetryTestCases() {
    this.messagesBuilder.testCaseRuns
      .filter((testCaseRun) => !testCaseRun.willBeRetried())
      .forEach((testCaseRun) => {
        const finalRetry = new FinalRetryTestCase(testCaseRun, this.messagesBuilder.testRun.id);
        this.finalRetryTestCases.set(finalRetry.testCaseId, finalRetry.envelope);
        this.finalRetryTestCaseRunIds.add(finalRetry.testCaseRunId);
        this.finalRetryTestStepIdsByRunId.set(finalRetry.testCaseRunId, finalRetry.testStepIds);
      });
  }

  /**
   * Replaces or drops each envelope for the HTML view:
   * - testCase envelopes are replaced with the final-retry version (filtered hook steps)
   * - envelopes belonging to retried attempts are dropped entirely
   * - hook step envelopes that are absent in the final-retry testCase are dropped
   * - all other envelopes pass through unchanged
   */
  transformEnvelope(envelope: messages.Envelope) {
    if (envelope.testCase) {
      return this.finalRetryTestCases.get(envelope.testCase.id);
    }

    if (this.shouldDropRetriedAttemptEnvelope(envelope)) return;
    if (this.shouldDropHookStepEnvelope(envelope)) return;

    return envelope;
  }

  /**
   * Drops envelopes that belong to retried (non-final) test case runs.
   * A testCaseStartedId is present on testCaseStarted / testCaseFinished / testStepStarted /
   * testStepFinished / attachment envelopes — any of these must be discarded for retried runs.
   */
  private shouldDropRetriedAttemptEnvelope(envelope: messages.Envelope) {
    const testCaseStartedId = this.getTestCaseStartedId(envelope);
    return Boolean(testCaseStartedId && !this.finalRetryTestCaseRunIds.has(testCaseStartedId));
  }

  /**
   * Drops hook step envelopes that were executed in a previous retry but not in the final run.
   * Only envelopes that carry both a testCaseStartedId and a testStepId are checked, because
   * only those are tied to a specific step (testStepStarted, testStepFinished, attachment).
   */
  private shouldDropHookStepEnvelope(envelope: messages.Envelope) {
    const testCaseStartedId = this.getTestCaseStartedId(envelope);
    const testStepId = this.getTestStepId(envelope);
    if (!testCaseStartedId || !testStepId) return false;

    const finalRetryTestStepIds = this.finalRetryTestStepIdsByRunId.get(testCaseStartedId);
    return Boolean(finalRetryTestStepIds && !finalRetryTestStepIds.has(testStepId));
  }

  /**
   * Extracts the testCaseStartedId that ties an envelope to a particular test run attempt.
   * Each envelope type stores it under a different field name, so all variants are checked.
   */
  private getTestCaseStartedId(envelope: messages.Envelope) {
    return (
      envelope.testCaseFinished?.testCaseStartedId ||
      envelope.testCaseStarted?.id ||
      envelope.testStepStarted?.testCaseStartedId ||
      envelope.testStepFinished?.testCaseStartedId ||
      envelope.attachment?.testCaseStartedId
    );
  }

  /**
   * Extracts the testStepId from envelopes that are scoped to a specific step.
   * Only testStepStarted, testStepFinished and attachment carry this field;
   * other envelope types return undefined, which tells the caller the envelope is not step-scoped.
   */
  private getTestStepId(envelope: messages.Envelope) {
    return (
      envelope.testStepStarted?.testStepId ||
      envelope.testStepFinished?.testStepId ||
      envelope.attachment?.testStepId
    );
  }
}
