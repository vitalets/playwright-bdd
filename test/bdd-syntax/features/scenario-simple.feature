Feature: scenario-simple

  Scenario: Scenario one
    Given State 1
    When Action 1
    Then Passed int arg 42 to equal 42
    And Passed string arg "foo" to equal "foo"

  Scenario: Custom parameter types
    Given Set context prop "greeting" = "hello"
    Then Passed custom type arg red to equal "red"
    And Custom param-no-transformer is "dog"
    And World value "greeting" equals "hello"
