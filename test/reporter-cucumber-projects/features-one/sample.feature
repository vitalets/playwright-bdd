Feature: feature one

  Scenario: scenario of project one
    Given State 1
    And Fails for project "project one copy"
    And TodoPage: step

  Scenario Outline: scenario with examples
    Given State <start>
    And State <end>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

    Examples:
      | start | end |
      | 4     | 8   |
