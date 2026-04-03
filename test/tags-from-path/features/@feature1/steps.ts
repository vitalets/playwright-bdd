import { createBdd } from 'playwright-bdd';
import { test } from '../shared-steps';

const { BeforeWorker, AfterWorker, BeforeScenario, AfterScenario, BeforeStep, AfterStep, Given } =
  createBdd(test);

BeforeWorker(async ({ log }) => {
  log(`BeforeWorker 1`);
});

AfterWorker(async ({ log }) => {
  log(`AfterWorker 1`);
});

BeforeScenario(async ({ log }) => {
  log(`BeforeScenario 1`);
});

AfterScenario(async ({ log }) => {
  log(`AfterScenario 1`);
});

BeforeStep(async ({ log }) => {
  log(`BeforeStep 1`);
});

AfterStep(async ({ log }) => {
  log(`AfterStep 1`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: a step`);
});
