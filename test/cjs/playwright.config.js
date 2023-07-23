const { defineConfig } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.js',
  paths: ['*.feature'],
  require: ['steps/*.js'],
});

module.exports = defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
