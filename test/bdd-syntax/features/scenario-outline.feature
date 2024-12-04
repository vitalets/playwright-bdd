Feature: scenario-outline

  Scenario Outline: Check doubled
    Given State <start>
    Then Doubled <start> equals <end>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

    Examples:
      | start | end |
      | 4     | 8   |

  Scenario Template: Check uppercase
    Then Uppercase "<s1>" equals "<s2>"

    Examples:
      | s1 | s2 |
      | hi | HI |
      | fo | FO |

  Scenario Outline: Custom examples title via gherkin comment
    Given State <start>

    # title-format: Test with <start> and "<end>", extra >, without <notexist>
    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

  # see: https://github.com/vitalets/playwright-bdd/issues/67
  Scenario Outline: Custom examples title via scenario name with <start> and "<end>", extra <, without <notexist>
    Given State <start>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

    Examples: Custom examples title via examples name with <start>
      | start | end |
      | 4     | 8   |

  # outline without examples behaves like normal scenario
  Scenario Outline: scenario outline without examples
    Given State 123

  Scenario Outline: scenario outline with empty examples (1)
    Given State <start>

    Examples:


    Examples:


  Scenario Outline: scenario outline with empty examples (2)
    Given State <start>

    Examples:
      | start | end |
