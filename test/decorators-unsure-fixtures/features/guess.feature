Feature: decorators-unsure-fixtures

    Scenario: error as it's unclear what fixture to use for BasePage: step
      Given TodoPage: step
      Given TodoPage2: step
      Given BasePage: step
  