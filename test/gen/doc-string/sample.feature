Feature: Playwright site

    Scenario: Check home
        Given I see text:
          ```
          Some Title, Eh?
          ===
          Here is the first paragraph with different quote types '`"
          Do you see it?
          ```
