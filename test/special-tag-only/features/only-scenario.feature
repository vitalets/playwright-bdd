Feature: only scenario

  @only
  Scenario: scenario with only
    Given "passing" step

  Scenario: scenario without only
    Given "failing" step

  @foo
  @only
  Scenario: scenario with only and other tags
    Given "passing" step

  # @only takes precendence over @skip
  @only
  @skip
  Scenario: scenario with only and skip
    Given "passing" step

  @only
  Scenario Outline: scenario outline with only
    Given "<type>" step

    Examples:
      | type    |
      | passing |

  Scenario Outline: scenario outline with only example
    Given "<type>" step

    Examples:
      | type    |
      | failing |

    @only
    Examples:
      | type    |
      | passing |
