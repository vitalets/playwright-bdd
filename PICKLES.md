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
  pickleStep 2.2 (C, C1)

pickle 3 (scenario 2, example row 2)
  pickleStep 3.1 (A)
  pickleStep 3.2 (C, C2)
```
Mapping it back to feature file:
```gherkin
Feature: feature 1

  Background: # not referenced from any pickle
    A # referenced from 3 pickle steps: 1.1, 2.1, 3.1

  Scenario: scenario 1 # referenced from: pickle 1
    B # referenced from 1 pickle step: 1.2

  Scenario Outline: scenario 2 # referenced from: pickle 2, pickle 3
    C # referenced from 2 pickle steps: 2.2, 3.2
    
  Examples:
    C1 # referenced from 1 pickle step: 2.2
    C2 # referenced from 1 pickle step: 3.2 
```
