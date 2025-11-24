# Implementation Plan: Multiple Step Decorators (#340)

## Overview
Add support for multiple step decorators on a single method to allow different natural language phrasings without complex regex patterns.

## Current Behavior
- Each method can only have one `@Given/@When/@Then/@Step` decorator
- Step configuration is stored in a Symbol property on the method: `decoratedStepSymbol`
- During `@Fixture` decorator execution, the method is inspected and step is registered once

## Desired Behavior
```typescript
@When("a item {string} exists")
@When("a item called {string} is added")
async addItem(itemName: string) {
    await this.inputField.fill(itemName);
    await this.addItemButton.click();
}
```

This should register **two separate step definitions** that point to the same method implementation.

## Implementation Steps

### 1. Update Step Storage Mechanism
**File:** `src/steps/decorators/steps.ts`

**Current:**
- Stores single `StepDefinitionOptions` in `decoratedStepSymbol`
- Type: `{ [decoratedStepSymbol]: StepDefinitionOptions }`

**Change to:**
- Store **array** of `StepDefinitionOptions` instead
- Type: `{ [decoratedStepSymbol]: StepDefinitionOptions[] }`

**Implementation:**
- Modify `saveStepConfigToMethod()`:
  - Check if array already exists on method
  - If yes, append to array
  - If no, create new array with single item
- Modify `getStepOptionsFromMethod()`:
  - Return array instead of single item (or undefined)

### 2. Update Step Registration Loop
**File:** `src/steps/decorators/steps.ts`

**Current:**
```typescript
export function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode) {
  // ...
  Object.values(propertyDescriptors).forEach((descriptor) => {
    const stepOptions = getStepOptionsFromMethod(descriptor);
    if (!stepOptions) return;
    stepOptions.pomNode = pomNode;
    stepOptions.defaultTags = pomNode.fixtureTags;
    registerDecoratorStep(stepOptions);
  });
}
```

**Change to:**
```typescript
export function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode) {
  // ...
  Object.values(propertyDescriptors).forEach((descriptor) => {
    const stepOptionsArray = getStepOptionsFromMethod(descriptor);
    if (!stepOptionsArray) return;
    
    // Register each step definition
    stepOptionsArray.forEach((stepOptions) => {
      stepOptions.pomNode = pomNode;
      stepOptions.defaultTags = pomNode.fixtureTags;
      registerDecoratorStep(stepOptions);
    });
  });
}
```

### 3. Add Tests
Create comprehensive test suite to verify the feature works correctly.

**Test Directory:** `test/decorators-multiple/`

**Test cases:**
1. **Basic multiple decorators** - Same keyword (e.g., two `@When`)
   ```typescript
   @When("a item {string} exists")
   @When("a item called {string} is added")
   async addItem(itemName: string) { ... }
   ```

2. **Mixed keywords** - Different keywords on same method
   ```typescript
   @Given("I have item {string}")
   @When("I add item {string}")
   async setupItem(itemName: string) { ... }
   ```

3. **With options** - Decorators with tags
   ```typescript
   @Given("step one", { tags: "@foo" })
   @Given("step two", { tags: "@bar" })
   async step() { ... }
   ```

4. **Inheritance** - Multiple decorators in parent and child classes
   ```typescript
   class BasePage {
     @Given("base step 1")
     @Given("base step 2")
     step() { ... }
   }
   
   @Fixture('page')
   class Page extends BasePage {
     @When("child step 1")
     @When("child step 2")
     childStep() { ... }
   }
   ```

5. **Cucumber expressions** - With parameters
   ```typescript
   @Then("result is {int}")
   @Then("I see result {int}")
   async checkResult(value: number) { ... }
   ```

6. **RegExp patterns**
   ```typescript
   @When(/^a item (?:called )?"([^"]+)"$/)
   @When("a item {string}")
   async addItem(name: string) { ... }
   ```

7. **Error handling** - Verify both definitions show up in duplicate step errors

**Test Structure:**
```
test/decorators-multiple/
  ├── playwright.config.ts
  ├── package.json
  ├── test.mjs
  ├── features/
  │   ├── basic.feature
  │   ├── mixed-keywords.feature
  │   ├── with-tags.feature
  │   └── inheritance.feature
  └── steps/
      ├── fixtures.ts
      └── poms.ts
```

### 4. Update Documentation

**Files to update:**

1. **API Documentation** - `docs/api.md`
   - Update `@Given / @When / @Then / @Step` section
   - Add example showing multiple decorators
   - Note that each decorator registers a separate step definition

2. **Decorators Guide** - `docs/writing-steps/decorators.md`
   - Add new section "Multiple decorators per method"
   - Show practical examples
   - Explain use cases (readability, team collaboration)
   - Show comparison with regex approach

3. **Changelog** - `CHANGELOG.md`
   - Add entry in next version section
   - Reference issue #340

**Example documentation snippet:**
```markdown
### Multiple decorators per method

You can apply multiple step decorators to the same method to support different phrasings:

\`\`\`typescript
export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @When("a item {string} exists")
  @When("a item called {string} is added")
  async addItem(itemName: string) {
    await this.inputField.fill(itemName);
    await this.addItemButton.click();
  }
}
\`\`\`

This is equivalent to defining two separate methods but reduces duplication. 
Each decorator registers a separate step definition that points to the same implementation.

This approach is especially useful for:
- Supporting natural language variations
- Accommodating different team members' writing styles
- Avoiding complex regex patterns
```

### 5. Edge Cases to Consider

1. **Location tracking** - Each decorator should maintain correct line number
   - Current implementation uses `getLocationByOffset(3)` 
   - Should work correctly as each decorator call is separate

2. **Performance** - No significant impact expected
   - Only affects registration phase (build time)
   - Runtime execution unchanged

3. **Backward compatibility** - Fully backward compatible
   - Single decorator still works exactly as before
   - Existing code requires no changes

4. **Error messages** - Should show all patterns if duplicate found
   - Already handled by `formatDuplicateStepsMessage()`
   - Will naturally show both patterns as they're separate definitions

5. **Snippets generation** - Should work without changes
   - Snippets look at missing steps, not at how many decorators a method has

## Testing Strategy

### Unit Tests
- no unit tests needed

### Integration Tests
- Run actual Playwright tests with `.feature` files
- Verify both step patterns match correctly
- Verify execution uses same method
- Test with inheritance
- Test with tags
- Test error scenarios (duplicate definitions)

### Manual Testing
- Create example in `examples/decorators-multiple/`
- Test in real-world scenario
- Verify IDE integration still works (if applicable)

## Rollout Plan

1. **Phase 1: Core implementation** (1-2 hours)
   - Update storage mechanism
   - Update registration loop
   - Basic manual testing

2. **Phase 2: Comprehensive tests** (2-3 hours)
   - Create test suite
   - Cover all test cases
   - Verify edge cases

3. **Phase 3: Documentation** (1 hour)
   - Update API docs
   - Update decorator guide
   - Add examples
   - Update changelog

4. **Phase 4: Review & Release**
   - Code review
   - CI/CD verification
   - Release in next minor version

## Risk Assessment

**Low Risk:**
- Minimal code changes (only 2 functions affected)
- Backward compatible
- Well-defined scope
- Similar patterns exist in Cucumber implementations

**Potential Issues:**
- None identified - straightforward implementation

## Success Criteria

- [ ] Multiple decorators can be applied to same method
- [ ] Each decorator registers separate step definition
- [ ] Both patterns correctly match their steps
- [ ] Same method implementation is called for all patterns
- [ ] Works with inheritance
- [ ] Works with tags
- [ ] Works with both Cucumber expressions and RegExp
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No breaking changes

## Estimated Effort

- **Development:** 4-6 hours
- **Testing:** 2-3 hours  
- **Documentation:** 1 hour
- **Total:** 7-10 hours

## References

- Issue: https://github.com/vitalets/playwright-bdd/issues/340
- Similar implementation in Cucumber-Ruby, Cucumber-JVM
