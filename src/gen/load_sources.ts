/**
 * Copied from original load_sources, but returns full Pickles.
 */
/// <reference path="./gherkin.d.ts" />

import {
  IRunEnvironment,
  ISourcesCoordinates,
} from '@cucumber/cucumber/lib/api/types';
import { resolvePaths } from '@cucumber/cucumber/lib/api/paths';
import { IdGenerator } from '@cucumber/messages';
import { mergeEnvironment } from '@cucumber/cucumber/lib/api/environment';
import { getFilteredPicklesAndErrors } from '@cucumber/cucumber/lib/api/gherkin';
import { ConsoleLogger } from '@cucumber/cucumber/lib/api/console_logger';
import { ILogger } from '@cucumber/cucumber/lib/logger';

/**
 * Load and parse features, produce a filtered and ordered test plan and/or parse errors.
 *
 * @public
 * @param coordinates - Coordinates required to find features
 * @param environment - Project environment.
 */
export async function loadSources(
  coordinates: ISourcesCoordinates,
  environment: IRunEnvironment = {},
) {
  const { cwd, stderr, debug } = mergeEnvironment(environment);
  const logger: ILogger = new ConsoleLogger(stderr, debug);
  const newId = IdGenerator.uuid();
  const { unexpandedFeaturePaths, featurePaths } = await resolvePaths(
    logger,
    cwd,
    coordinates,
  );
  if (featurePaths.length === 0) {
    return {
      filteredPickles: [],
      parseErrors: [],
    };
  }
  const { filteredPickles, parseErrors } = await getFilteredPicklesAndErrors({
    newId,
    cwd,
    logger,
    unexpandedFeaturePaths,
    featurePaths,
    coordinates,
  });
  return {
    filteredPickles,
    parseErrors,
  };
}
