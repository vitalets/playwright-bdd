Feature: built-in fixtures (playwright-style only)

  Scenario: fixtures defined in different function formats
    Given fixtures available in arrow fn
    Then fixtures available in normal fn

  Scenario: empty fixtures
    Then empty fixtures in arrow fn
    Then empty fixtures 2 in arrow fn
    Then empty fixtures in normal fn
    Then empty fixtures 2 in normal fn
    Then empty fixtures with int param 1

  Scenario: playwright-bdd built-in fixtures
    Then bdd-fixtures should be defined
