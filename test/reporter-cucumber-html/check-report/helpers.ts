import { expect, type Locator } from '@playwright/test';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function fixtureHookTitleRegexp(prefix: 'BeforeAll' | 'AfterAll', fixtureName: string) {
  const escapedPrefix = escapeRegExp(prefix);
  const escapedFixtureName = escapeRegExp(fixtureName);

  // Playwright has changed fixture hook titles across versions:
  // - "fixture: myFixture"
  // - "myFixture"
  // - "Fixture \"myFixture\""
  return new RegExp(
    `^${escapedPrefix}: (?:fixture: ${escapedFixtureName}|${escapedFixtureName}|Fixture "${escapedFixtureName}")$`,
  );
}

export async function expectAttachmentTexts(attachments: Locator, expectedTexts: string[]) {
  const actualTexts = await attachments.allTextContents();
  // Playwright 1.59 adds an automatic markdown attachment for failed tests.
  const filteredTexts = actualTexts.filter((text) => !text.startsWith('error-context'));
  expect(filteredTexts).toEqual(expectedTexts);
}
