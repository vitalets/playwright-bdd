Feature: timeout-scenario-outline

  @timeout:5000
  Scenario Outline: scenario 1
    Then delay <delay>

    Examples:
      | delay |
      | 1050  |

  Scenario Outline: scenario 2
    Then delay <delay>

    @timeout:5000
    Examples:
      | delay |
      | 1050  |
