/**
 * Creating Cucumber exception from Playwright errors.
 * See: https://github.com/cucumber/messages/blob/main/jsonschema/messages.md#exception
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { stripAnsiEscapes } from '../../../utils/stripAnsiEscapes';

export function buildException(error: pw.TestError): messages.Exception {
  const messageWithSnippet = getMessageWithSnippet(error);
  const stack = getStackTrace(error);
  const fullMessage = [messageWithSnippet, stack].filter(Boolean).join('\n\n');

  return {
    type: 'Error',
    message: messageWithSnippet,
    stackTrace: fullMessage,
  };
}

function getMessageWithSnippet(error: pw.TestError) {
  const message = error.message ? stripAnsiEscapes(error.message).trim() : String(error);
  const snippet = error.snippet ? stripAnsiEscapes(error.snippet) : '';
  return [message, snippet].filter(Boolean).join('\n\n');
}

function getStackTrace(error: pw.TestError) {
  return error.stack ? extractStackTrace(stripAnsiEscapes(error.stack)) : '';
}

function extractStackTrace(errorStack: string) {
  return errorStack
    .split('\n')
    .filter((line) => line.match(/^\s+at .*/))
    .join('\n');
}
