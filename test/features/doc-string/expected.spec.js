/** Generated from: test/gen/doc-string/sample.feature */
import { test } from "playwright-bdd";

test.describe("Playwright site", () => {
  test("Check home", async ({ Given }) => {
    await Given("I see text:", {"docString":{"content":"Some Title, Eh?\n===\nHere is the first paragraph with different quote types '`\"\nDo you see it?"}});
  });
});