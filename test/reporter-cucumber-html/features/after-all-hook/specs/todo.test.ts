// import { test } from '../../../check-report/fixtures';

// All these tests are skipped because they are marked as passed in Cucumber html report.
// It's because afterAll hooks run in worker fixture teardown phase that is not related to any test.
// In case of error, this error is reported via reporter.onError, not in test results.
//
// It would be better to run afterAll hooks inside test.afterAll(),
// but it's will work incorrectly if single afterAll hook is tagged to several features,
// because it will be run several times.
// Or just un-tagged afterAll hook + several files.

/*
test.describe.skip('error in anonymous after all hook', () => {
  test.use({ featureUri: 'failing-after-all/anonymous.feature' });

  test('scenario 1', async () => {});
  test('scenario 2', async () => {});
});

test.describe.skip('error in named after all hook', () => {
  test.use({ featureUri: 'failing-after-all/named.feature' });

  test('scenario 1', async () => {});
});

test.describe.skip('error in worker fixture teardown', () => {
  test.use({ featureUri: 'failing-after-all/fixture.feature' });

  test('scenario 1', async () => {});
});

test.describe.skip('timeout in after-all hook', () => {
  test.use({ featureUri: 'failing-after-all/timeout.feature' });

  test('scenario 1', async () => {});
});
*/
