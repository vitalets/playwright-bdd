Feature: fail scenario

  @fail
  Scenario: scenario 1
    Given "failing" step

  Scenario Outline: scenario 2
    Given "<type>" step

    @fail
    Examples:
      | type    |
      | failing |

    Examples:
      | type    |
      | passing |
