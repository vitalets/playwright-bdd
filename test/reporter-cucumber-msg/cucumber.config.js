/**
 * This Cucumber config is used to generate expected messages report.
 * Keep the name cucumber.config.js (not cucumber.js)
 * to avoid automatic reauire by Cucumber inside playwright-bdd.
 *
 * Usage:
 * node test/reporter-cucumber-msg/helpers/run-c.mjs <featureDir>
 * node test/reporter-cucumber-msg/helpers/run-c.mjs minimal
 */
const featureDir = process.env.FEATURE_DIR;

if (!featureDir) throw new Error(`Empty FEATURE_DIR`);

module.exports = {
  default: {
    paths: [`features/${featureDir}`],
    require: [`features/${featureDir}/common.steps.ts`, `features/${featureDir}/cucumber.steps.ts`],
    requireModule: ['ts-node/register'],
    format: [
      ['message', `features/${featureDir}/expected/messages.ndjson`],
      ['json', `features/${featureDir}/expected/json-report.json`],
    ],
  },
};
