Feature: Retry with hooks

  # Scenario A runs first in worker 1. BeforeAll is credited to A's PW result.
  Scenario: scenario that always passes
    Given a step that passes

  # Scenario B runs second in worker 1. Its attempt 0 result has NO BeforeAll pwStep.
  # When B fails, PW restarts the worker. In the new worker B is first, so
  # attempt 1 result DOES have BeforeAll. TestCase.addRun(attempt 1) adds BeforeAll to
  # B's TestCase. Then buildMessages for attempt 0 finds BeforeAll in the TestCase
  # (leaked from attempt 1) but no matching pwStep -> emits PASSED with duration=0.
  Scenario: scenario that fails first time
    Given a step that passes the second time
