@feature-tag
Feature: rich feature

  Background:
      Given Action 0

  @scenariio-tag
  Scenario: Scenario with different steps
    Given Action 1
    When Step with data table
      | name  | value |              
      | foo   | bar   |
      | x     | 42    |

    Then Step with doc string
      ```
      Text with different quote types '`"
      ```

    And attach text
    And attach image inline
    # And attach screenshot as a file

  Scenario: Scenario with all keywords
    Given Action 1
    And Action 2
    When Action 3
    And Action 4
    Then Action 5
    But Action 6
    * Action 7

	Scenario Outline: Check doubled
    Given Action <start>
    Then Action <end>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |

	Examples:
		| start | end |
		|    4  |   8 |
 