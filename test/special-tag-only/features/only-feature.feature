@only
Feature: only feature

  Scenario: scenario 1
    Given "passing" step

  # @skip has precendence over feature level @only
  @skip
  Scenario: skipped scenario
    Given "failing" step
