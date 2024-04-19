Feature: skip scenario

  @skip
  Scenario: skipped scenario
    Given skipped step

  @fixme
  Scenario: fixme scenario
    Given skipped step

  @skip
  Scenario Outline: skipped scenario outline
    Given skipped step
    Given success step <value>

    Examples:
      | value |
      | 1     |

  Scenario Outline: scenario outline with skipped example
    Given success step <value>

    Examples:
      | value |
      | 1     |

    @skip
    Examples:
      | value |
      | 2     |
