import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps/*.ts'],
  worldParameters: { myParam: 'myValue' },
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
