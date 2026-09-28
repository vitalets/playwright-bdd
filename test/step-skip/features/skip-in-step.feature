Feature: skip in step

  @log-after-step
  Scenario: step that skips itself
    Given a passing step
    When a step that skips itself
    Then the next step runs

  Scenario: step with a false skip condition
    Given a step with a false skip condition
    Then the next step runs
