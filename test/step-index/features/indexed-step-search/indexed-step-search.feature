Feature: Indexed step search

  Scenario: Scenario 1
    Given open LongestWord
    And open :OtherWord
    And use LongestWord via PrimaryAction
    And use LongestWord via SecondaryAction
    And longestword
    And bar}

  Scenario: Scenario 2
    Given choose CommonWord second
    And pick SharedWord second
    And use PrimaryAction value
    And use SecondaryAction value

  Scenario: Scenario 3
    Given close OtherWord LongestWord
    And read LongestWord
      """
      text
      """
