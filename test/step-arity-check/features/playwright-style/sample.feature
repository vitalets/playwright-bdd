Feature: step arity check - playwright style

  Scenario: missing args for expression step
    Given pw step with missing args 42

  Scenario: missing args for doc string step
    Given pw doc step with missing args
      """
      some content
      """

  Scenario: too many args for expression step
    Given pw step with too many args 42

  Scenario: too many args for doc string step
    Given pw doc step with too many args
      """
      some content
      """
