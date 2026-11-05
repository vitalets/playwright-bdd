Feature: step arity check - decorator style

  @valid
  Scenario: Allow omitted capture parameters
    Given decorator step with omitted parameters 42

  @valid
  Scenario: Allow omitted doc string parameters
    Given decorator doc step with omitted parameters
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

  Scenario: Shared methods reject parameters beyond every expression
    Given shared method with excess parameters for every expression

  @valid
  Scenario: Arity check considers all decorators for a method
    Given decorator step
    And regexp decorator step
    And bdd-expr decorator step

  @valid
  Scenario: Allow optional, default and rest parameters
    Given decorator step with an optional doc string or data table parameter
    And decorator step with an optional doc string or data table parameter
      """
      hello
      """
    And decorator step with an optional doc string or data table parameter
      | hello |
    And decorator step 3 with a default parameter
    And decorator step 3 with rest parameters
