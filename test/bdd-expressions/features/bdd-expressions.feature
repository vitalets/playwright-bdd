Feature: bdd-expressions

  Scenario: Scenario one
    Given I have 3 items for "Alice"
    And I have 2 items
    And disabled BDD expressions :name is 4
    And step 3 with no positional params
    And BDD expressions disabled by default :name is 5
    And local choice green
    And regex number 6
    And custom price 7
    And mixed 8 and "label"
    And message "hello"
      """
      content
      """
