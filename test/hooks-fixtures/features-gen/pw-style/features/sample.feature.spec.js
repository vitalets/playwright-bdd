/** Generated from: features/sample.feature */
import { test } from "../../../pw-style/fixtures";

test.describe("hooks-fixtures", () => {

  test("scenario 1", async ({ Given, someTestFixture }) => {
    await Given("State 1", null, { someTestFixture });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $testMetaMap: ({}, use) => use(testMetaMap),
  $uri: ({}, use) => use("features/sample.feature"),
  $scenarioHookFixtures: ({ page, someTestFixture, someWorkerFixture }, use) => use({ page, someTestFixture, someWorkerFixture }),
  $workerHookFixtures: [({ someWorkerFixture }, use) => use({ someWorkerFixture }), { scope: "worker" }],
});

const testMetaMap = {
  "scenario 1": {"pickleLocation":"3:3"},
};