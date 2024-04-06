Feature: data-table

  Scenario: Data table
    Then Passed data table to have in row 2 col "email" value "matt@cucumber.io"
      | name   | email              | twitter         |
      | Aslak  | aslak@cucumber.io  | @aslak_hellesoy |
      | Julien | julien@cucumber.io | @jbpros         |
      | Matt   | matt@cucumber.io   | @mattwynne      |
