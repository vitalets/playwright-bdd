Feature: docstring-and-data-table

  Scenario: Match and capture DocString and DataTable parameters
    Given payload
      """
      content
      """
    And payload
      | name  |
      | Alice |
    And optional payload
    And optional payload:
      """

      """
    And optional payload:
      """
      content
      """
    And alternative payload
      """
      content
      """
    And alternative payload
      | name  |
      | Alice |
    And unnamed payload
      """

      """
    And table without an explicit parameter
      | value |
    And optional table
    And optional table:
      | value |
