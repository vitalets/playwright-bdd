/**
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/duration_helpers.ts#L5
 */

import { Duration } from '@cucumber/messages';

const NANOS_IN_SECOND = 1_000_000_000;

export function durationToNanoseconds(duration: Duration): number {
  return Math.floor(duration.seconds * NANOS_IN_SECOND + duration.nanos);
}
