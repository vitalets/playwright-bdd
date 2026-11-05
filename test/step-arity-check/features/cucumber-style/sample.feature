Feature: step arity check - cucumber style

  Scenario: Allow omitted capture parameters
    Given cucumber step with omitted parameters 42

  Scenario: Allow omitted doc string parameters
    Given cucumber doc step with omitted parameters
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
