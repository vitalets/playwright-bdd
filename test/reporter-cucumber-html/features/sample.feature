@feature-tag
Feature: rich feature

  Background:
    Given step failing for scenario "Failing by background step"

  # keep failing scenarios first to run in a first shard
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

  # Success scenarios
  Scenario: Scenario with data table
    When Step with data table
      | name  | value |              
      | foo   | bar   |
      | x     | 42    |

  Scenario: Scenario with doc string
    Then Step with doc string
      ```
      some text
      ```

  Scenario: Scenario with attachments
    Given attach text
    And attach image inline
    And attach image as file

  Scenario: Scenario with all keywords
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

  Scenario: match snapshot
    When open page "https://example.com"
    Then page title snapshot matches the golden one

	Scenario Outline: Check doubled
    Given Action <start>
    Then Action <end>

  # we add more rows to have more success tests than failed
  # it's important to ensure that second shard tests always pass
	Examples:
		| start | end  |
		|    2  |   4  |
		|    3  |   6  |
		|    4  |   8  |
		|    5  |   10 |
		|    6  |   12 |

	Examples:
		| start  | end |
		|    10  |   20 |
 