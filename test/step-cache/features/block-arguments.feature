Feature: Cached step block arguments

  Scenario: Scenario 1
    Given I read a payload
      """

      """
    And I read a payload
      """
      hello
      """
    And I read a payload
      | name  |
      | Alice |
    And I read a payload
      | name |
      | Bob  |
