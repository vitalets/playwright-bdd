Feature: step arity check - playwright style

  Scenario: invalid step function arguments
    Given pw step no params, two args
    Given pw step one param 42, no args
    Given pw step one param 42, one arg
    Given pw step no params, no args for docstring
      """
      some content
      """
    Given pw step no params, one arg for docstring
      """
      some content
      """
    Given pw step one param 42, three args
    Given pw step no params, three args for docstring
      """
      some content
      """

  @valid
  Scenario: valid step function arguments
    Given pw step no params, no args
    Given pw step no params, one arg
    Given pw step one param 42, no args, arity check disabled
