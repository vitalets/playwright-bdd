import { createBdd } from 'playwright-bdd';
import { test } from '../shared-steps';

const { BeforeWorker, AfterWorker, BeforeScenario, AfterScenario, BeforeStep, AfterStep, Given } =
  createBdd(test);

BeforeWorker(async ({ log }) => {
  log(`BeforeWorker 2`);
});

AfterWorker(async ({ log }) => {
  log(`AfterWorker 2`);
});

BeforeScenario(async ({ log }) => {
  log(`BeforeScenario 2`);
});

AfterScenario(async ({ log }) => {
  log(`AfterScenario 2`);
});

BeforeStep(async ({ log }) => {
  log(`BeforeStep 2`);
});

AfterStep(async ({ log }) => {
  log(`AfterStep 2`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: a step`);
});
