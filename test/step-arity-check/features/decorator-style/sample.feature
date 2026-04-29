Feature: step arity check - decorator style

  Scenario: missing args for expression step
    Given decorator step with missing args 42

  Scenario: missing args for doc string step
    Given decorator doc step with missing args
      """
      some content
      """

  Scenario: too many args for expression step
    Given decorator step with too many args 42

  Scenario: too many args for doc string step
    Given decorator doc step with too many args
      """
      some content
      """
