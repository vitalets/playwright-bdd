/** Generated from: test/gen/scenario-and-but-star/sample.feature */
import { test } from "playwright-bdd";

test.describe("Feature one", () => {
  test("Scenario one", async ({ Given, And, When, Then, But }) => {
    await Given("Action 1");
    await And("Action 2");
    await And("Action 3");
    await When("Action 4");
    await And("Action 5");
    await Then("Action 6");
    await And("Action 7");
    await But("Action 8");
  });
  test("Scenario two", async ({ Given, And, When, Then }) => {
    await Given("Action 1");
    await And("Action 2");
    await And("Action 3");
    await When("Action 4");
    await And("Action 5");
    await Then("Action 6");
    await And("Action 7");
    await And("Action 8");
  });
});