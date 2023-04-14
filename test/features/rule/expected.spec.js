/** Generated from: test/gen/rule/sample.feature */
import { test } from "playwright-bdd";

test.describe("Feature one", () => {
  test.beforeEach(async ({ Given }) => {
    await Given("Background on feature level");
  });
  test.describe("Rule one", () => {
    test.beforeEach(async ({ Given }) => {
      await Given("Background for rule one");
    });
    test("Scenario one", async ({ Given, When, Then }) => {
      await Given("Action 1");
      await When("Action 2");
      await Then("Action 3");
    });
    test("Scenario two", async ({ When, Then }) => {
      await When("Action 4");
      await Then("Action 5");
    });
  });
  test.describe("Rule two", () => {
    test.beforeEach(async ({ Given }) => {
      await Given("Background for rule two");
    });
    test("Scenario three", async ({ Then }) => {
      await Then("Action 3");
    });
  });
});