@fixture:basePage
Feature: incorrect feature tag for bg

    Background:
      Given TodoPage: step

    Scenario: error in background
      Given BasePage: step
