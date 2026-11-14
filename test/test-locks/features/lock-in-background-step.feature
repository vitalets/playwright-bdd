Feature: Lock in background step

  Background:
    Given step with lock: lock9

  Scenario: [lock9, lock1] inherits Feature Background locks
    Given step with lock: lock1

  Rule: Rule background

    Background:
      Given step with lock: lock10

    Scenario: [lock9, lock10, lock1] combines Feature and Rule Background locks
      Given step with lock: lock1
