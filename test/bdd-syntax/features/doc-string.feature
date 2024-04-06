Feature: doc-string

  Scenario: Check doc string
    Then Passed doc string to contain "Some Title, Eh?"
      ```
      Some Title, Eh?
      ===
      Here is the first paragraph with different quote types '`"
      ```
