import { Given, BeforeAll, AfterAll } from './fixtures';

const logger = console;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
BeforeAll(({ $workerInfo, myWorkerFixture }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: BeforeAll 1`);
});

BeforeAll(({ $workerInfo }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: BeforeAll 2`);
});

BeforeAll({ tags: '@feature1' }, ({ $workerInfo }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: BeforeAll for feature 1`);
});

BeforeAll({ tags: '@feature2' }, ({ $workerInfo }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: BeforeAll for feature 2`);
});

AfterAll(({ $workerInfo }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: AfterAll 1`);
});

AfterAll(({ $workerInfo }) => {
  logger.log(`worker ${$workerInfo.workerIndex}: AfterAll 2`);
});

Given('a step', ({ $testInfo }) => {
  logger.log(`worker ${$testInfo.workerIndex}: a step of ${$testInfo.title}`);
});
