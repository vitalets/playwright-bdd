/** Generated from: features/sample.feature */
import { test } from "../../../cucumber-style/fixtures";

test.describe("hooks-fixtures", () => {

  test("scenario 1", async ({ Given }) => {
    await Given("State 1");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $testMetaMap: ({}, use) => use(testMetaMap),
  $uri: ({}, use) => use("features/sample.feature"),
  $scenarioHookFixtures: ({ page, someTestFixture, someWorkerFixture }, use) => use({ page, someTestFixture, someWorkerFixture }),
  $workerHookFixtures: [({ someWorkerFixture }, use) => use({ someWorkerFixture }), { scope: "worker" }],
  $world: ({ world }, use) => use(world),
});

const testMetaMap = {
  "scenario 1": {"pickleLocation":"3:3"},
};