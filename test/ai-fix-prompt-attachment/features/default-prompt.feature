Feature: Default prompt

  Background:
    Given I am on homepage

  Scenario: Default page ok
    Then failing step

  Scenario: Default page closed
    Then I close default page and trigger error

  Scenario: Custom page
    Then failing step on custom page fixture
