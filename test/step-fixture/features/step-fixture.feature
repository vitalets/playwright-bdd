Feature: Step fixture

  Scenario: Step metadata and native info are scoped to each step
    Given a step with a doc string
      """application/json
      { "value": 42 }
      """
    Then a step without a doc string

  Scenario: A skipped step does not affect the next step
    Given a skipped step
    Then a step without a doc string
