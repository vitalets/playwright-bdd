const { defineConfig } = require('@playwright/test');
const { defineBddConfig, cucumberReporter } = require('playwright-bdd');

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps/*.js'],
});

module.exports = defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
