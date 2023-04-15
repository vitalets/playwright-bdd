Feature: scenario-outline

	Scenario Outline: Check doubled
    Given State <start>
    Then Doubled <start> to equal <end>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |

	Examples:
		| start | end |
		|    4  |   8 |
