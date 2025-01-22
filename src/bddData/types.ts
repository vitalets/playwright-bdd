/**
 * Bdd data for each test, used in runtime and in cucumber reporter.
 *
 * Example:
 *
 * const bddData = [ // bdd-data-start
 *   {"pwTestLine":6, "pickleLine":8, "tags":["@foo"],"steps":[ ... ]},
 *   {"pwTestLine":10, "pickleLine":11, "tags":[],"steps":[ ... ]},
 * ]; // bdd-data-end
 *
 */

import { PickleStepType, StepMatchArgument } from '@cucumber/messages';

export type BddFileData = BddTestData[];

export type BddTestData = {
  pwTestLine: number;
  pickleLine: number;
  tags: string[];
  skipped?: boolean;
  timeout?: number;
  slow?: boolean;
  steps: BddStepData[]; // pickle steps: (bg steps + scenario steps)
};

export type BddStepData = {
  pwStepLine: number;
  gherkinStepLine: number;
  keywordType: PickleStepType | undefined;
  textWithKeyword: string;
  pomFixtureName?: string;
  stepMatchArguments?: StepMatchArgument[];
  isBg?: boolean;
};
