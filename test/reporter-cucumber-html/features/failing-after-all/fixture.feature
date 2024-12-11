Feature: error in worker fixture teardown (after-all)

  Scenario: scenario 1
    Given Action 1
    Given step that uses workerFixtureWithErrorInTeardown
