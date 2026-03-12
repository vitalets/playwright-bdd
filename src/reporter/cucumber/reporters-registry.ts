/**
 * Keep track of the Cucumber reporters count and messagesBuilder instance.
 */
import { MessagesBuilder } from './messagesBuilder';

let cucumberReportersCount = 0;
let messagesBuilder: MessagesBuilder | null;

export function getMessagesBuilder() {
  if (!messagesBuilder) messagesBuilder = new MessagesBuilder();
  return messagesBuilder;
}

export function registerReporter() {
  cucumberReportersCount++;
  return cucumberReportersCount === 1;
}

export function unregisterReporter() {
  cucumberReportersCount = Math.max(0, cucumberReportersCount - 1);
  // Recreate messagesBuilder on each test run.
  // (mainly applicable to the runs from VS code extension)
  if (cucumberReportersCount === 0) messagesBuilder = null;
}
