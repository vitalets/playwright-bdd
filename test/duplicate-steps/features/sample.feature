Feature: duplicate steps

  @duplicate-regular-steps
  Scenario: duplicate regular steps
    Given duplicate step

  @duplicate-decorator-steps
  Scenario: duplicate decorator steps
    Given duplicate decorator step

  @duplicate-tagged-steps
  Scenario: duplicate tagged steps
    Given duplicate tagged step

  @no-duplicates
  Scenario: no duplicates
    Given unique step
