const { defineConfig } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps/*.js'],
});

module.exports = defineConfig({
  testDir,
});
