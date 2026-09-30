import { playwrightVersion } from './utils';

export const supportedFeatures = {
  // PW 1.55 and 1.56 incorrectly show a warning for boxed fixtures that are defined but not used.
  // See: https://github.com/microsoft/playwright/issues/37147
  boxedFixturesWarning: playwrightVersion >= '1.55.0' && playwrightVersion < '1.57.0',
};
