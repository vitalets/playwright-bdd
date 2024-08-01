/**
 * Warnings module.
 * Shows warning if not disabled and not shown.
 */
import { logger } from '../utils/logger';
import { BDDConfig } from './types';

type Warning = 'importTestFrom';

export type DisableWarningsConfig = boolean | Record<Warning, boolean>;

const shownWarnings = new Set<Warning>();

export function showWarnings(configs: BDDConfig[]) {
  for (const config of configs) {
    warningImportTestFrom(config);
  }
}

function warningImportTestFrom(config: BDDConfig) {
  if (canShowWarning(config, 'importTestFrom') && config.importTestFrom) {
    showWarning(
      'importTestFrom',
      'Option "importTestFrom" in defineBddConfig() is not needed anymore.',
      'Try to remove it and include that file into "steps" pattern.',
    );
  }
}

function canShowWarning(config: BDDConfig, warning: Warning) {
  if (config.disableWarnings === true) return false;
  if (typeof config.disableWarnings === 'object' && config.disableWarnings[warning]) return false;
  if (shownWarnings.has(warning)) return false;
  return true;
}

function showWarning(warning: Warning, ...messages: string[]) {
  shownWarnings.add(warning);
  logger.warn('WARNING:', ...messages);
  logger.warn(
    `--\nThis warning can be disabled by setting in BDD config: `,
    `\ndisableWarnings: { ${warning}: true }`,
    `\nFeel free to report any bugs: https://github.com/vitalets/playwright-bdd/issues`,
  );
}
