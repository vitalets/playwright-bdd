Feature: Snippets

  Scenario: Some scenario
    Given Step without parameters
    # intentional duplicate
    Given Step without parameters
    Given Step with one string parameter "foo"
    # intentional duplicate
    Given Step with one string parameter "bar"
    Given Step with two string parameters "foo" and "bar"
    Given Step with one float parameter 2.3
    Given Step with one int parameter 2
    Given Step with two int parameters 2 and 3
    Given Step with docString
      ```
      Some Text
      ```
    Given Step with dataTable
      | name | email |
      | foo  | bar   |

    When I click link "Get started"
    Then I see in title "Installation"
