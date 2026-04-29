Feature: step arity check - cucumber style

  Scenario: missing args for expression step
    Given cucumber step with missing args 42

  Scenario: missing args for doc string step
    Given cucumber doc step with missing args
      """
      some content
      """

  Scenario: too many args for expression step
    Given cucumber step with too many args 42

  Scenario: too many args for doc string step
    Given cucumber doc step with too many args
      """
      some content
      """
