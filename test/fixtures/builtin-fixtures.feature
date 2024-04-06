Feature: custom fixtures in playwright-style

  Scenario: fixtures defined in different function formats
    Given fixtures available in arrow fn
    Then fixtures available in normal fn

  Scenario: empty fixtures
    Then empty fixtures in arrow fn
    Then empty fixtures 2 in arrow fn
    Then empty fixtures in normal fn
    Then empty fixtures 2 in normal fn
    Then empty fixtures with int param 1

  Scenario: playwright built-in fixtures


  Scenario: playwright-bdd built-in fixtures
    # cant make vscode extension to recognize these steps
    Then $testInfo is available as a fixture and its title equals to "playwright-bdd built-in fixtures"
    Then $test is available as a fixture and test.info().title equals to "playwright-bdd built-in fixtures"
