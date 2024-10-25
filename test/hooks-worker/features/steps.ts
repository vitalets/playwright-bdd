import { Given, BeforeAll, AfterAll } from './fixtures';

const logger = console;

BeforeAll(({ $workerInfo }) => {
  logger.log(`BeforeAll 1 worker ${$workerInfo.workerIndex}`);
});

BeforeAll(({ $workerInfo }) => {
  logger.log(`BeforeAll 2 worker ${$workerInfo.workerIndex}`);
});

AfterAll(({ $workerInfo }) => {
  logger.log(`AfterAll 1 worker ${$workerInfo.workerIndex}`);
});

AfterAll(({ $workerInfo }) => {
  logger.log(`AfterAll 2 worker ${$workerInfo.workerIndex}`);
});

Given('a step', ({ $testInfo }) => {
  logger.log(`a step of ${$testInfo.title}`);
});
