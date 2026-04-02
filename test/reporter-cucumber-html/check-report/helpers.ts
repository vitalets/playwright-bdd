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
