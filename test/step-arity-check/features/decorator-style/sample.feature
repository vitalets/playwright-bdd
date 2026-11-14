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
    Given step without capture parameters
    And step without a docstring parameter

  @valid
  Scenario: Arity check considers all decorators for a method
    Given Cucumber expression without parameters
    And regexp without captures
    And BDD expression without parameters
    And step without number or docstring parameters
    And step with required docstring
      """
      content
      """

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
