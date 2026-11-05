Feature: step arity check - playwright style

  Scenario: Reject excess parameters while allowing omitted parameters
    Given pw step with no captures and an optional doc string parameter
    Given pw step 42 with no parameters
    Given pw step 42 with fixtures only
    Given pw doc string step with no parameters
      """
      some content
      """
    Given pw doc string step with fixtures only
      """
      some content
      """
    Given pw step 42 with excess parameters
    Given pw doc string step with excess parameters
      """
      some content
      """

  @valid
  Scenario: Allow zero captures and disabled arity checks
    Given pw step with no captures and no parameters
    Given pw step with no captures and fixtures only
    Given pw step 42 with excess parameters and arity check disabled

  @valid
  Scenario: Accept omitted, optional, default and rest parameters
    Given pw step 42 with no parameters
    And pw step 42 with fixtures only
    And step with an optional doc string or data table parameter
    And step with an optional doc string or data table parameter
      """
      hello
      """
    And step with an optional doc string or data table parameter
      | hello |
    And step 3 with a default parameter
    And step 3 with rest parameters
    And step reading a doc string through $step only
      """
      hello
      """
    And step reading a data table through $step only
      | hello |

  @explicit
  Scenario: Step option enables checking
    Given step with excess parameters and arity check explicitly enabled
