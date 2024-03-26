/**
 * Representation of https://github.com/cucumber/cucumber-js/blob/main/src/paths/paths.ts
 * Since Cucumber 10.1 resolvePaths was moved from lib/api/paths to lib/paths/paths.
 * This module makes resolvePaths working with any version of Cucumber.
 * See: https://github.com/cucumber/cucumber-js/pull/2361/files
 *
 * todo: replace with own paths resolution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { IRunConfiguration, IRunEnvironment } from '@cucumber/cucumber/api';
import { mergeEnvironment } from '@cucumber/cucumber/lib/api/environment';
import { ConsoleLogger } from '@cucumber/cucumber/lib/api/console_logger';
import { ILogger } from '@cucumber/cucumber/lib/logger';
import { resolvePackageRoot } from '../utils';

/**
 * Returns list of absolute feature paths.
 */
// eslint-disable-next-line max-statements
export async function resovleFeaturePaths(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
): Promise<{ featurePaths: string[]; unexpandedFeaturePaths: string[] }> {
  const { cwd, stderr, debug } = mergeEnvironment(environment);
  const logger: ILogger = new ConsoleLogger(stderr, debug);
  const cucumberRoot = resolvePackageRoot('@cucumber/cucumber');
  const pathsModuleBefore10_1 = path.join(cucumberRoot, 'lib/api/paths.js');
  const pathsModuleAfter10_1 = path.join(cucumberRoot, 'lib/paths/paths.js');
  const isNewResolvePaths = fs.existsSync(pathsModuleAfter10_1);
  if (isNewResolvePaths) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolvePaths } = require(pathsModuleAfter10_1);
    const { sourcePaths, unexpandedSourcePaths } = await resolvePaths(
      logger,
      cwd,
      runConfiguration.sources,
    );
    return {
      featurePaths: sourcePaths,
      unexpandedFeaturePaths: unexpandedSourcePaths,
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolvePaths } = require(pathsModuleBefore10_1);
    const { featurePaths, unexpandedFeaturePaths } = await resolvePaths(
      logger,
      cwd,
      runConfiguration.sources,
    );
    return {
      featurePaths,
      unexpandedFeaturePaths,
    };
  }
}
