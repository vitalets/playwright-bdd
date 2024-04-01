/**
 * Fields config for JSON report shape comparison
 */
import { toPosixPath } from '../_helpers/index.mjs';

export const jsonReportFields = {
  ignorePaths: [
    // ignored b/c there is no stepDefinitions (yet)
    // See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts#L279
    'elements.#.steps.#.match.location',
    // todo: check why tags line is empty
    'elements.#.tags.#.line',
  ],

  // these paths are compared by values, not by counter.
  valuePaths: [
    'id', // prettier-ignore
    'name',
    'uri',
    'metadata.#.name',
    'metadata.#.value',
    'elements.#.steps.#.result.status',
    'elements.#.steps.#.result.status',
    'elements.#.steps.#.name',
  ],

  transform: (key, value) => (key.endsWith('uri') ? toPosixPath(value) : value),
};
