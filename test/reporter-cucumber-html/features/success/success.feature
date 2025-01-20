@feature-tag
Feature: success

  @retries:1
  Scenario: Scenario with retries
    Given Action 1
    And fails until retry 1
    And Action 2

  Scenario: Scenario with data table
    When Step with data table
      | name | value |
      | foo  | bar   |
      | x    | 42    |

  Scenario: Scenario with doc string
    Then Step with doc string
      ```
      some text
      ```

  Scenario: Scenario with attachments
    Given attach text via testInfo
    And attach text via attachments.push
    And attach image inline
    And attach image as file
    And attach stdout
    And attach buffer as stdout

  @success-before-hook
  @success-after-hook
  Scenario: Scenario with all keywords and success hooks
    Given Action 1
    And Action 2
    When Action 3
    And Action 4
    Then Action 5
    But Action 6
    * Action 7

  @skip
  Scenario: Skipped scenario
    Given Action 1
    And Action 2

  Scenario Outline: Check doubled
    Given Action <start>
    Then Action <end>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

    Examples:
      | start | end |
      | 10    | 20  |
