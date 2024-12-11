Feature: error-in-step

  Scenario: error in step
    Given step with page
    Given failing step
    When Action 1

  Scenario: timeout in step
    Given step with page
    Given timeouted step
    When Action 1

  # - If this scenario name changed, snapshot file names should also change
  Scenario: failing match snapshot
    When step with page
    Then error in match snapshot

  Scenario: soft assertions
    Given failing soft assertion "foo"
    And Action 1
    And failing soft assertion "bar"
    And Action 2
