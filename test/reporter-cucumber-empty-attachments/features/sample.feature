Feature: empty attachments

  Scenario: empty stderr chunk
    Given a step writes an empty chunk to stderr
    And a step logs some output

  Scenario: empty attachment
    Given a step attaches an empty text

  Scenario: scenario after them
    Given a step does nothing
