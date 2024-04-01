/**
 * Fields config for JUNIT report shape comparison
 */
import { toPosixPath } from '../_helpers/index.mjs';

export const junitReportFields = {
  ignorePaths: [],

  // these paths are compared by values, not by counter.
  valuePaths: [
    'testsuite.testcase.#.$.name', // prettier-ignore
    'testsuite.testcase.#.$.classname',
    'testsuite.testcase.#.failure.#.$.type',
    'testsuite.$.name',
    'testsuite.$.tests',
    'testsuite.$.skipped',
    'testsuite.$.failures',
  ],

  transform: (key, value) => (key.endsWith('uri') ? toPosixPath(value) : value),
};
