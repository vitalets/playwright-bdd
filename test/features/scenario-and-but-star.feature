Feature: scenario-and-but-star

    Scenario: Scenario with and/but
        Given State 1
        And State 2
        And Set world param "foo" = "bar"
        When Action 4
        And Action 5
        Then Check 1
        And Check 7
        But World param "foo" to equal "bar"

    Scenario: Scenario with star
        Given State 1
        * State 2
        * Set world param "foo" = "bar"
        When Action 4
        * Action 5
        Then Check 1
        * Check 7
        * World param "foo" to equal "bar"