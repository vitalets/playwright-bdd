/**
 * Creating Cucumber errors from Playwright errors.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { stripAnsiEscapes } from '../../../utils/stripAnsiEscapes';

export function buildErrorMessage(error: pw.TestError) {
  return stripAnsiEscapes([error.message, error.snippet].filter(Boolean).join('\n'));
}

export function buildException(error: pw.TestError): messages.Exception {
  return {
    type: 'Error',
    message: buildErrorMessage(error),
    // todo: extract only trace?
    stackTrace: error.stack ? extractStackTrace(stripAnsiEscapes(error.stack)) : undefined,
  };
}

function extractStackTrace(errorStack: string) {
  return errorStack
    .split('\n')
    .filter((line) => line.match(/^\s+at .*/))
    .join('\n');
}
