/**
 * Wrapper function to define Cucumber reporter in a type-safe way in Playwright config.
 *
 * Examples:
 * reporter: [cucumberReporter('html', { outputFile: 'cucumber-report.html' })],
 * reporter: [cucumberReporter('./reporter.ts', { foo: 'bar' })],
 */
import type { BuiltinReporters, CucumberReporterOptions } from '.';
import { isBddGenPhase } from '../../cli/helpers/bddgenPhase';
import { setFixWithAiEnabled } from '../../config/fixWithAi';

export function cucumberReporter<T extends keyof BuiltinReporters | string>(
  type: T,
  userOptions?: CucumberReporterOptions<T>,
): [string, unknown] {
  handleFixWithAiOptionInHtmlReport(type, userOptions);

  return ['playwright-bdd/reporter/cucumber', { $type: type, ...(userOptions || {}) }] as const;
}

// eslint-disable-next-line visual/complexity
function handleFixWithAiOptionInHtmlReport<T extends keyof BuiltinReporters | string>(
  type: T,
  userOptions?: CucumberReporterOptions<T>,
) {
  if (
    isBddGenPhase() &&
    type === 'html' &&
    userOptions &&
    'fixWithAi' in userOptions &&
    Boolean(userOptions.fixWithAi)
  ) {
    setFixWithAiEnabled();
  }
}
