Feature: Lock in step

  @metadata
  Scenario: [lock1, lock2, lock3, lock4, lock5] combines and deduplicates locks across step styles
    Given step with lock: lock1
    And step with locks: lock2, lock1, lock2
    And Cucumber-style step with lock: lock3
    And decorator step with locks: lock4, lock1
    And first alias of a step with lock: lock5
    And second alias of a step with lock: lock5

  @foo
  Scenario: [lock6] uses only the matching scoped definition
    Given scoped step with lock: lock6

  Scenario: [lock8] uses only the matching decorator
    Given decorator step with lock: lock8

  Scenario Outline: inherits the same static lock for every example
    Given step with lock: lock1
    And step with value <value>

    # title-format: [lock1] example <value>
    Examples:
      | value |
      | 1     |
      | 2     |

  Scenario: [] does not infer locks from nested calls
    Given step without a lock that calls a step with lock: lock12

  Scenario: preserves special characters in lock names
    Given step with quotes, a backslash, a template expression, and a newline in its lock name

  Scenario: [] unrelated locked definitions do not add test details
    Given step without a lock

  Scenario: [] an empty lock list does not add test details
    Given step with an empty lock list
