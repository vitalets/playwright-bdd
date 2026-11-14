Feature: Failure after skip

  @error-in-after-step-hook
  Scenario: Unnamed after hook failure wins over body skip
    Given the body skips
    Then the next step runs

  @error-in-named-after-step-hook
  Scenario: Named after hook failure wins over body skip
    Given the body skips
    Then the next step runs
