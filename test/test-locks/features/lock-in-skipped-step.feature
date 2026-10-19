Feature: Lock in skipped step

  @skip
  Scenario: [] omits locks for skipped scenarios
    Given step with lock: lock1

  @fixme
  Scenario: [] omits locks for fixme scenarios
    Given step with lock: lock1

  @skip-missing
  Scenario: [] omits locks when missing steps skip the scenario
    Given step with lock: lock1
    And step without a definition

  @runtime-skip
  Scenario: [lock11] retains locks for runtime skips
    Given step with lock: lock11 that skips at runtime

  @fail-on-run
  Scenario: [lock1] retains locks when missing steps fail at runtime
    Given step with lock: lock1
    And step without a definition
