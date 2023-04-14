/** Generated from: test/gen/scenario-outline/sample.feature */
import { test } from "playwright-bdd";

test.describe("Playwright site", () => {
  test.describe("eating", () => {
    test("Example #1", async ({ When, Then }) => {
      await When("I've counted 2 times");
      await Then("You say doubled is 4");
    });
    test("Example #2", async ({ When, Then }) => {
      await When("I've counted 3 times");
      await Then("You say doubled is 6");
    });
    test("Example #3", async ({ When, Then }) => {
      await When("I've counted 4 times");
      await Then("You say doubled is 8");
    });
  });
});