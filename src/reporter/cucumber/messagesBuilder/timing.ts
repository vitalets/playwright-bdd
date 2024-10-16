/**
 * Timing utils.
 */
import { TimeConversion } from '@cucumber/messages';

export function toCucumberTimestamp(time: number) {
  return TimeConversion.millisecondsSinceEpochToTimestamp(time);
}
