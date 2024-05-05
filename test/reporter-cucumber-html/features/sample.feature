@feature-tag
Feature: rich feature

  Background:
    Given step failing for scenario "Failing by background step"

  # - Increased timeout b/c this test opens page
  @timeout:10_000
  Scenario: Failing by step
    Given failing step

  Scenario: Failing by background step
    Given Action 1

  @failing-anonymous-hook
  Scenario: Failing by anonymous before hook
    Given Action 1

  @failing-named-hook
  Scenario: Failing by named before hook
    Given Action 1

  Scenario: Failing by failingBeforeFixtureNoStep
    Given step that uses failingBeforeFixtureNoStep
    When Action 1

  Scenario: Failing by failingBeforeFixtureWithStep
    Given step that uses failingBeforeFixtureWithStep
    When Action 2

  Scenario: Failing by failingAfterFixtureNoStep
    Given step that uses failingAfterFixtureNoStep
    When Action 3

  Scenario: Failing by failingAfterFixtureWithStep
    Given step that uses failingAfterFixtureWithStep
    When Action 4

  # - If this scenario name changed, snapshot file names should also change
  # - Increased timeout b/c this test opens page
  @timeout:10_000
  Scenario: failing match snapshot
    When open page "https://example.com"
    Then page title snapshot matches the golden one

  Scenario: timeout in before fixture
    Given Action 0
    Given step that uses timeouted before fixture
    When Action 1

  Scenario: timeout in step
    Given Action 0
    Given timeouted step
    When Action 1

  # see: https://github.com/microsoft/playwright/issues/30175
  Scenario: timeout in after fixture
    Given Action 0
    Given step that uses timeouted after fixture
    When Action 1

  Scenario: timeout in step and in after fixture
    Given Action 0
    Given timeouted step
    When Action 1
    Given step that uses timeouted after fixture

  Scenario: soft assertions
    Given failing soft assertion "foo"
    And Action 1
    And failing soft assertion "bar"
    And Action 2

  # ----- Success scenarios ------
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
    Given attach text
    And attach image inline
    And attach image as file
    And attach stdout

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
