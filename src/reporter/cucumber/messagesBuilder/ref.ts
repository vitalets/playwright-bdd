/**
 * Returns reference to a messagesBuilder singleton instance.
 * We pass onTestEnd and onEnd calls only for the first reference (reporter),
 * otherwise all events will be duplicated.
 */

import * as pw from '@playwright/test/reporter';
import { MessagesBuilder } from '.';

export type MessagesBuilderRef = ReturnType<typeof getMessagesBuilderRef>;

let instance: MessagesBuilder;
let referenceCount = 0;

export function getMessagesBuilderRef() {
  if (!instance) instance = new MessagesBuilder();
  const isFirstRef = ++referenceCount === 1;
  return {
    builder: instance,
    onBegin(config: pw.FullConfig) {
      if (isFirstRef) this.builder.onBegin(config);
    },
    onTestEnd(test: pw.TestCase, result: pw.TestResult) {
      if (isFirstRef) this.builder.onTestEnd(test, result);
    },
    onEnd(fullResult: pw.FullResult) {
      if (isFirstRef) this.builder.onEnd(fullResult);
    },
  };
}
