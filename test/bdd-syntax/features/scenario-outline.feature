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

  Scenario: Generated file contains all examples for "scenario outline"
    Then File "scenario-outline.feature.spec.js" contains
      | substring                  |
      | Given("State 2")           |
      | Given("State 3")           |
      | Given("State 4")           |
      | Then("Doubled 2 equals 4") |
      | Then("Doubled 3 equals 6") |
      | Then("Doubled 4 equals 8") |

  Scenario Template: Check uppercase
    Then Uppercase "<s1>" equals "<s2>"

    Examples:
      | s1 | s2 |
      | hi | HI |
      | fo | FO |

  Scenario: Generated file contains all examples for "scenario template"
    Then File "scenario-outline.feature.spec.js" contains
      | substring                              |
      | Then("Uppercase \"hi\" equals \"HI\"") |
      | Then("Uppercase \"fo\" equals \"FO\"") |

  Scenario Outline: Custom titles
    Given State <start>

    # title-format: Test with <start> and "<end>", extra >, without <notexist>
    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

  Scenario: Generated file contains all examples for "custom titles"
    Then File "scenario-outline.feature.spec.js" contains
      | substring                                                  |
      | test("Test with 2 and \"4\", extra >, without <notexist>", |
      | test("Test with 3 and \"6\", extra >, without <notexist>", |

  # see: https://github.com/vitalets/playwright-bdd/issues/67
  Scenario Outline: Scenario title used as a template with <start> and "<end>", extra <, without <notexist>
    Given State <start>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |

  Scenario: Generated file contains all examples for "Scenario title used as a template"
    Then File "scenario-outline.feature.spec.js" contains
      | substring                                                                               |
      | test("Scenario title used as a template with 2 and \"4\", extra <, without <notexist>", |
      | test("Scenario title used as a template with 3 and \"6\", extra <, without <notexist>", |
