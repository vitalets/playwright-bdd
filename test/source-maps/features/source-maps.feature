Feature: Source maps

  Scenario: Scenario 1
    Given I log "scenario 1 message"

  Scenario Outline: Scenario Outline 1
    Given I log "<message>"

    Examples:
      | message  |
      | message1 |
      | message2 |

  Scenario Outline: Scenario Outline 2
    Given I log "<message>"

    Examples:
      | message  |
      | message3 |
      | message4 |

  Rule: Rule 1

    Scenario: Scenario 2
      Given I log "scenario 2 message"
