Feature: scenario-outline

	Scenario Outline: Check doubled
    Given State <start>
    Then Doubled <start> equals <end>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |

	Examples:
		| start | end |
		|    4  |   8 |

  Scenario: Generated file contains all examples for "scenario outline"
    Then File "scenario-outline.feature.spec.js" contains 'Given("State 2")'
    Then File "scenario-outline.feature.spec.js" contains 'Given("State 3")'
    Then File "scenario-outline.feature.spec.js" contains 'Given("State 4")'
    Then File "scenario-outline.feature.spec.js" contains 'Then("Doubled 2 equals 4")'
    Then File "scenario-outline.feature.spec.js" contains 'Then("Doubled 3 equals 6")'
    Then File "scenario-outline.feature.spec.js" contains 'Then("Doubled 4 equals 8")'

	Scenario Template: Check uppercase
    Then Uppercase "<s1>" equals "<s2>"

	Examples:
		| s1    | s2    |
		| hi    | HI    |
		| fo    | FO    |

  Scenario: Generated file contains all examples for "scenario template"
    Then File "scenario-outline.feature.spec.js" contains 'Then("Uppercase \\"hi\\" equals \\"HI\\"")'
    Then File "scenario-outline.feature.spec.js" contains 'Then("Uppercase \\"fo\\" equals \\"FO\\"")'
