Feature: timeout-scenario

  # checking _ separator as well
  @timeout:5_000
  Scenario: scenario 1
    Then delay 1050

  @timeout:5000
  Scenario Outline: scenario 2
    Then delay <delay>

    Examples:
      | delay |
      | 1050  |

  Scenario Outline: scenario 3
    Then delay <delay>

    @timeout:5000
    Examples:
      | delay |
      | 1050  |
