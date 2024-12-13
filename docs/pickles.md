<!-- Technical details about Cucumber pickles, not linked from docs -->

# Pickles

Relation between Cucumber pickles and Gherkin scenarios is quite tricky, especially when there are background and examples. THe breakdown below helps to understand that.

Imagine the following feature file:
```gherkin
Feature: feature 1

  Background:
    A

  Scenario: scenario 1
    B

  Scenario Outline: scenario 2
    C
    
  Examples:
    C1
    C2  
```

It produces 3 pickles, `astNodeIds` are shown in brackets:
```
pickle 1 (scenario 1)
  pickleStep 1.1 (A)
  pickleStep 1.2 (B)

pickle 2 (scenario 2, example row 1)
  pickleStep 2.1 (A)
  pickleStep 2.2 (C)

pickle 3 (scenario 2, example row 2)
  pickleStep 3.1 (A)
  pickleStep 3.2 (C)
```
Mapping it back to feature file:
```gherkin
Feature: feature 1

  Background: # referenced from: none
    A # referenced from: pickleStep 1.1, pickleStep 2.1, pickleStep 3.1

  Scenario: scenario 1 # referenced from: pickle 1
    B # referenced from: pickleStep 1.2

  Scenario Outline: scenario 2 # referenced from: pickle 2, pickle 3
    C # referenced from: pickleStep 2.2, pickleStep 3.2
    
  Examples:
    C1 # referenced from: pickle 2
    C2 # referenced from: pickle 3
```
