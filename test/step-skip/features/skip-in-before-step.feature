Feature: skip in BeforeStep

  @skip-in-before-step
  Scenario: step skipped in BeforeStep
    Given a passing step
    When a step skipped in BeforeStep
    Then the next step runs
