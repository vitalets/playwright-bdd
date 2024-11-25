/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeforeAll, AfterAll } from './fixtures';

BeforeAll(({ log, workerFixtureCommon }) => {
  log(`BeforeAll 1`);
});

BeforeAll(({ log }) => {
  log(`BeforeAll 2`);
});

BeforeAll({ tags: '@feature1' }, ({ log, workerFixture1 }) => {
  log(`BeforeAll 3 (@feature1)`);
});

BeforeAll({ tags: 'not @feature1' }, ({ log, workerFixture2 }) => {
  log(`BeforeAll 4 (not @feature1)`);
});

BeforeAll({ tags: '@unused' }, ({ log }) => {
  log(`BeforeAll 5 (@unused)`);
});

// AfterAll

AfterAll(({ log, workerFixtureCommon }) => {
  log(`AfterAll 1`);
});

AfterAll(({ log }) => {
  log(`AfterAll 2`);
});

AfterAll({ tags: '@feature1' }, ({ log, workerFixture1 }) => {
  log(`AfterAll 3 (@feature1)`);
});

AfterAll({ tags: 'not @feature1' }, ({ log, workerFixture2 }) => {
  log(`AfterAll 4 (not @feature1)`);
});

AfterAll({ tags: '@unused' }, ({ log }) => {
  log(`AfterAll 5 (@unused)`);
});
