Feature: doc-string

  Scenario: Check doc string
    Then Passed doc string has media type "markdown" and contains "Some Title, Eh?"
      ```markdown
      # Some Title, Eh?

      Here is the first paragraph with different quote types '`"
      ```
