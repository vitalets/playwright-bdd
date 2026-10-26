Feature: Lock in tags validation

  @invalid
  @lock:
  Scenario: Rejects an empty lock name
    Given step without a lock

  @ordinary
  @LOCK:uppercase
  @custom-lock:embedded
  Scenario: [] ignores tags without the exact lock prefix
    Given step without a lock

  @case-sensitive
  @lock:Record
  @lock:record
  Scenario: [Record, record] preserves case-sensitive names
    Given step without a lock

  @escaped
  @lock:single'double"backtick`slash\dollar${name}
  Scenario: Escapes special characters in tag locks
    Given step without a lock
