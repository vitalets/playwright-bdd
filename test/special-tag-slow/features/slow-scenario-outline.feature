Feature: slow-scenario-outline

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
