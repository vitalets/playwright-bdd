Feature: scenario-simple

  Scenario: Scenario one
    Given State 1
    When Action 1
    Then Passed int arg 42 to equal 42
    And Passed string arg "foo" to equal "foo"
    And Passed custom type arg red to equal "red"
