Feature: duplicate steps

  @duplicate-regular-steps
  Scenario: duplicate regular steps
    Given duplicate step

  @duplicate-decorator-steps
  Scenario: duplicate decorator steps
    Given duplicate decorator step

  @no-duplicates
  Scenario: no duplicates
    Given unique step
