/**
 * Returns reference to a messagesBuilder singleton.
 * We pass onTestEnd and onEnd calls only for the first reference (reporter),
 * otherwise all events will be duplicated.
 */

import * as pw from '@playwright/test/reporter';
import { MessagesBuilder } from './Builder';

export type MessagesBuilderRef = ReturnType<typeof getMessagesBuilderRef>;

let instance: MessagesBuilder;
let referenceCount = 0;

export function getMessagesBuilderRef() {
  if (!instance) instance = new MessagesBuilder();
  const isFirstRef = ++referenceCount === 1;
  return {
    builder: instance,
    onStepBegin(test: pw.TestCase, result: pw.TestResult, step: pw.TestStep) {
      isFirstRef && this.builder.onStepBegin(test, result, step);
    },
    onStepEnd(test: pw.TestCase, result: pw.TestResult, step: pw.TestStep) {
      isFirstRef && this.builder.onStepEnd(test, result, step);
    },
    onTestEnd(test: pw.TestCase, result: pw.TestResult) {
      isFirstRef && this.builder.onTestEnd(test, result);
    },
    onEnd(fullResult: pw.FullResult) {
      isFirstRef && this.builder.onEnd(fullResult);
    },
  };
}
