Feature: error precedence

  @error-in-after-step-hook
  Scenario: original step error wins
    Given step with original error
