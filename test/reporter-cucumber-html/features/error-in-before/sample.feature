Feature: error-in-before

  @failing-anonymous-hook
  Scenario: Failing by anonymous before hook
    Given Action 1

  @failing-named-hook
  Scenario: Failing by named before hook
    Given Action 1

  Scenario: Failing by failingBeforeFixtureNoStep
    Given step that uses failingBeforeFixtureNoStep
    When Action 1

  Scenario: Failing by failingBeforeFixtureWithStep
    Given step that uses failingBeforeFixtureWithStep
    When Action 2

  Scenario: timeout in before fixture
    Given Action 0
    Given step that uses timeouted before fixture
    When Action 1
