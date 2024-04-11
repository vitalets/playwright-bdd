Feature: custom fixtures 1

  Scenario: test-scoped fixture scenario 1
    Then testScopedFixture prop equals to "initial value"
    When testScopedFixture set prop to "updated value"
    Then testScopedFixture prop equals to "updated value"

  Scenario: test-scoped fixture scenario 2
    Then testScopedFixture prop equals to "initial value"

  Scenario: worker-scoped fixture scenario 1
    Then workerScopedFixture prop equals to "initial value"
    When workerScopedFixture set prop to "updated value"
    Then workerScopedFixture prop equals to "updated value"

  Scenario: worker-scoped fixture scenario 2
    Then workerScopedFixture prop equals to "updated value"
