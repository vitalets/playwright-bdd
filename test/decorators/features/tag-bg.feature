@fixture:todoPage
Feature: tag with bg

    Background:
      Then BasePage: used fixture is "TodoPage"

    Scenario: scenario uses TodoPage by tag, background can not have tags
      Then BasePage: used fixture is "TodoPage"
