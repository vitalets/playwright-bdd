Feature: docstring-and-data-table-mismatches

  @missing
  Scenario: Required DocString and DataTable parameters must be present
    Given payload

  @missing
  Scenario: Optional doc string rejects a table
    Given optional payload:
      | value |

  @missing
  Scenario: Optional text must agree with DocString presence
    Given optional payload:

  @arity
  Scenario: DocString and DataTable parameters do not allow another argument
    Given excess argument
      """
      content
      """

  @missing
  Scenario: Optional table rejects a doc string
    Given optional table:
      """
      content
      """

  @ambiguous
  Scenario: Strict definitions have no priority over permissive definitions
    Given ambiguous payload
      """
      content
      """
