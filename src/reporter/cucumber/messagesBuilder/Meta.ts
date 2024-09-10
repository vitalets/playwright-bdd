/**
 * Builds meta message.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/cli/helpers.ts#L100
 */
import os from 'node:os';
import * as messages from '@cucumber/messages';
import { getPackageVersion } from '../../../utils/index.js';

export class Meta {
  buildMessage() {
    const playwrightBddVersion = getPackageVersion('playwright-bdd');
    const playwrightVersion = getPackageVersion('@playwright/test');
    const meta: messages.Meta = {
      protocolVersion: messages.version,
      implementation: {
        version: `${playwrightBddVersion} (playwright ${playwrightVersion})`,
        name: 'playwright-bdd',
      },
      cpu: {
        name: os.arch(),
      },
      os: {
        name: os.platform(),
        version: os.release(),
      },
      runtime: {
        name: 'node.js',
        version: process.versions.node,
      },
    };

    return { meta };
  }
}
