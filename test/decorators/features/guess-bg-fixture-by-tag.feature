@fixture:todoPage
Feature: guess bg fixture by tag

  Background:
    Given BasePage: step

  Scenario: scenario 1
    Given TodoPage: step
    Then used fixtures "TodoPage,TodoPage"
