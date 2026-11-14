@lock:feature
Feature: Lock in tags

  @lock:scenario
  @lock:feature
  @lock:lock1
  Scenario: [feature, scenario, lock1, lock2] combines tags and step locks in stable order
    Given step with locks: lock2, lock1, lock2

  Scenario: [feature] inherits Feature locks without step locks
    Given step without a lock

  @lock:rule
  Rule: Inherit resource locks

    @lock:scenario
    Scenario: [feature, rule, scenario] inherits Rule locks
      Given step without a lock

    @lock:outline
    Scenario Outline: Inherit Outline and Examples locks
      Given step without a lock

      @lock:examples
      @lock:feature
      Examples: [feature, rule, outline, examples] inherits Examples locks <value>
        | value  |
        | first  |
        | second |

      Examples: [feature, rule, outline] keeps Examples locks local
        | value |
        | third |
