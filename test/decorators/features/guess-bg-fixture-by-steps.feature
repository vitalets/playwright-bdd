Feature: guess bg fixture by steps

  Background:
    Given BasePage: step

  Scenario: scenario 1
    Given TodoPage: step
    Then used fixtures "TodoPage,TodoPage"

  Scenario: scenario 2
    Given TodoPage2: step
    Then used fixtures "TodoPage2,TodoPage2"
