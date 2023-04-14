/** Generated from: test/gen/background/sample.feature */
import { test } from "playwright-bdd";

test.describe("Playwright site", () => {
  test.beforeEach(async ({ Given }) => {
    await Given("I open url 'https://playwright.dev'");
  });
  test("Check home", async ({ Then }) => {
    await Then("I see in title 'Playwright'");
  });
  test("Check about", async ({ When, Then }) => {
    await When("I click link 'About'");
    await Then("I see in title 'About'");
  });
});