@foo
@bar
Feature: tags

  @foo
  @baz
  @jira:123
  Scenario: Simple scenario
    Then Tags are "@foo @bar @baz @jira:123"

  @scenario-outline
  Scenario Outline: Scenario with examples
    Then Tags are "<tags>"

    @scenario-outline-examples1
    Examples:
      | tags                                                    |
      | @foo @bar @scenario-outline @scenario-outline-examples1 |
      | @foo @bar @scenario-outline @scenario-outline-examples1 |

    @scenario-outline-examples2
    Examples:
      | tags                                                    |
      | @foo @bar @scenario-outline @scenario-outline-examples2 |

  @rule1
  Rule: Rule 1

    # important to set the same name "Simple scenario"
    @rule1-scenario
    Scenario: Simple scenario
      Then Tags are "@foo @bar @rule1 @rule1-scenario"

    @rule1-scenario-outline
    Scenario Outline: Scenario with examples
      Then Tags are "<tags>"

      @rule1-scenario-outline-examples
      Examples:
        | tags                                                                      |
        | @foo @bar @rule1 @rule1-scenario-outline @rule1-scenario-outline-examples |
        | @foo @bar @rule1 @rule1-scenario-outline @rule1-scenario-outline-examples |

  @rule2
  Rule: Rule 2

    # important to set the same name "Simple scenario"
    @rule2-scenario
    Scenario: Simple scenario
      Then Tags are "@foo @bar @rule2 @rule2-scenario"

    @rule2-scenario-outline
    Scenario Outline: Scenario with examples
      Then Tags are "<tags>"

      @rule2-scenario-outline-examples
      Examples:
        | tags                                                                      |
        | @foo @bar @rule2 @rule2-scenario-outline @rule2-scenario-outline-examples |
