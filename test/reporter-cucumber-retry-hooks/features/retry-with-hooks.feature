Feature: Retry with hooks

  # Scenario A runs first in worker 1. BeforeAll is credited to A's PW result.
  Scenario: scenario that always passes
    Given a step that passes

  # Scenario B fails on attempt 0 and is retried in a new worker.
  # In the new worker Scenario B passes, so its attempt 1 has a real BeforeAll pwStep.
  # During process of attempt 1, BeforeAll is added into the TestCase hooks.
  # But TestCase is a shared object across all attempts.
  # This test ensures that for the attempt 0, BeforeAll is emitted as SKIPPED.
  Scenario: scenario that fails first time
    Given a step that passes the second time
