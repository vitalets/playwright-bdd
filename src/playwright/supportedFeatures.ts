import { playwrightVersion } from './utils';

export const supportedFeatures = {
  ariaSnapshots: playwrightVersion >= '1.49.0',
};
