/** Generated from: test/gen/scenario/sample.feature */
import { test } from "playwright-bdd";

test.describe("Playwright site", () => {
  test("Check home", async ({ Given, When, Then }) => {
    await Given("I open url \"https://playwright.dev\"");
    await When("I click link \"Get started\"");
    await Then("I see in title \"Playwright\"");
  });
});