/** Generated from: sample.feature */
import { test } from "playwright-bdd";

test.describe("Playwright site", () => {

  test("Data table collection", async ({ Given, When, Then }) => {
    await Given("the following users exist:", {"dataTable":{"rows":[{"cells":[{"value":"name"},{"value":"email"},{"value":"twitter"}]},{"cells":[{"value":"Aslak"},{"value":"aslak@cucumber.io"},{"value":"@aslak_hellesoy"}]},{"cells":[{"value":"Julien"},{"value":"julien@cucumber.io"},{"value":"@jbpros"}]},{"cells":[{"value":"Matt"},{"value":"matt@cucumber.io"},{"value":"@mattwynne"}]}]}});
  });

});