Feature: Inheritance with multiple decorators

  Scenario: Using base step variants
    Given base step 1
    And base step 2
    Then log contains "baseStep,baseStep"

  Scenario: Using child step variants
    When child step 1
    And child step 2
    Then log contains "childStep,childStep"

  Scenario: Combining base and child steps
    Given base step 1
    When child step 1
    Then log contains "baseStep,childStep"
