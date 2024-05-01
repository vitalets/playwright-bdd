/**
 * Config's enrichReporterData is auto-configured if undefined.
 * It allows to automatically enrich reporter data when Cucumber reporter is used,
 * and don't enrich if Cucumber reporter is not used to keep Playwirhgt's reporter data clear.
 *
 * For auto-configuration we use a separate env variable,
 * b/c when resolving config reporter file is not executed yet.
 */
import { BDDConfig } from './types';

export function enableEnrichReporterData() {
  process.env.PLAYWRIGHT_BDD_ENRICH_REPORTER_DATA = '1';
}

export function getEnrichReporterData(config: BDDConfig) {
  const enrichReporterDataFromEnv = Boolean(process.env.PLAYWRIGHT_BDD_ENRICH_REPORTER_DATA);
  if (config.enrichReporterData === true) return true;
  if (config.enrichReporterData === false) {
    if (enrichReporterDataFromEnv) {
      throw new Error(
        [
          `Cucumber reports can't work with enrichReporterData = false in bdd config.`,
          `Please, set enrichReporterData = true OR remove it from config`,
          `to let it be auto-configured.`,
        ].join(' '),
      );
    }
    return false;
  }
  return enrichReporterDataFromEnv;
}
