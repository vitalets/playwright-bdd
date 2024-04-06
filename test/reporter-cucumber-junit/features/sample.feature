Feature: some feature

  Scenario: success scenario
    Given success step 1
    And success step 2

  Scenario: failing scenario
    Given success step 1
    And failing step

  Scenario Outline: scenario with examples
    Given success step <start>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

    Examples:
      | start | end |
      | 4     | 8   |
