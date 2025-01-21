Feature: error-in-bg

  # don't use 'step with page' here, as page sometimes can't initialize due to timeout
  Background:
    Given Action 0
    Given failing step

  Scenario: scenario 1
    Given Action 1

  Scenario: scenario 2
    Given Action 2
