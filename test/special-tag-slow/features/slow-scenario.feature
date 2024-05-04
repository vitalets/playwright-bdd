Feature: slow-scenario

  @slow
  Scenario: scenario 1
    Then delay 1050

  @slow
  Scenario Outline: scenario 2
    Then delay <delay>

    Examples:
      | delay |
      | 1050  |

  Scenario Outline: scenario 3
    Then delay <delay>

    @slow
    Examples:
      | delay |
      | 1050  |
