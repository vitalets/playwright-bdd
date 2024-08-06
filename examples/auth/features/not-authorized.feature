@noauth
Feature: Not-authorized user

  Scenario: Homepage shows "Please Sign In" for not-authorized user
    Given I am on homepage
    Then I see "Please Sign In" in navigation panel
