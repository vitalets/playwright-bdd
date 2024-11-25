import { BeforeAll, AfterAll } from './fixtures';

BeforeAll(async ({ log }) => {
  log(`BeforeAll 1`);
});

AfterAll(async ({ log }) => {
  log(`AfterAll 1`);
});
