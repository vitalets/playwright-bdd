Feature: Playwright site

	Scenario Outline: eating
        When I've counted <start> times
        Then You say doubled is <end>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |
