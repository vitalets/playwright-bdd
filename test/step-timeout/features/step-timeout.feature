Feature: step-timeout

  Scenario: Playwright-style step exceeds its timeout
    Given a Playwright step times out

  Scenario: Cucumber-style step exceeds its timeout
    Given a Cucumber step times out

  Scenario: Decorator step exceeds its timeout
    Given a decorator step times out

  Scenario: Steps complete with explicit, omitted, and zero timeouts
    Given a step completes within its timeout
    And a step has no timeout option
    And a step has zero timeout

  @slow-before-step-hook
  Scenario: Step timeout includes BeforeStep hooks
    Given a step has a slow hook

  @slow-after-step-hook
  Scenario: Step timeout includes AfterStep hooks
    Given a step has a slow hook

  @before-step-hook-timeout
  Scenario: Hook timeout retains its custom error message
    Given a step retains its hook timeout
