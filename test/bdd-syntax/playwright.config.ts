import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist';

const testDir = generateBDDTests({
  paths: ['features'],
  requireModule: ['ts-node/register'],
  ...(process.env.CUCUMBER_STYLE
    ? {
        require: ['steps/steps.cucumber-style.ts'],
      }
    : {
        importTestFrom: 'steps/fixtures',
        require: ['steps/steps.ts'],
      }),
});

export default defineConfig({
  testDir,
  testIgnore: 'only-skip-fixme.feature.spec.js',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
