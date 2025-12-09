# Testing Organization Conventions

This document describes the testing structure and patterns used in the Better Life project.

## Test Philosophy

The project uses **"guardrail tests"** - lightweight tests that enforce critical invariants rather than comprehensive test coverage. These tests catch breaking changes and validate critical contracts.

## Test Directory Structure

```
tests/
├── README.md                    # Test documentation
├── run-tests.js                 # Main test runner
├── test-helpers.js              # Test utilities and assertion library
├── api-response-guards.test.js # API response shape validation
├── utils-guards.test.js         # Utility function behavior checks
├── guardrails.test.js           # State shape documentation
├── state-manager.test.js        # State manager tests
├── state-manager-test.html      # Browser-based state tests
├── run-state-tests.js           # State test runner
└── *.test.js                    # Other test files
```

## Test File Naming

- **`.test.js`** suffix for all test files
- Descriptive names: `api-response-guards.test.js`, `state-manager.test.js`
- Group related tests: `*-guards.test.js` for guardrail tests

## Test Runner

### Main Test Runner

`tests/run-tests.js` - Runs all test files:

```bash
npm test
# or
node tests/run-tests.js
```

### Test Helpers

`tests/test-helpers.js` - Minimal assertion library (no external dependencies):

```javascript
// Test structure
describe('Test Suite', () => {
    it('should do something', () => {
        assert(condition, 'Error message');
    });
});
```

## Test Types

### Guardrail Tests

Tests that validate critical invariants:

1. **API Response Shapes** - Ensures all API responses match `APIResponse<T>` type
2. **Utility Functions** - Verifies critical utils behave correctly
3. **State Shapes** - Documents expected state structure

### Example Guardrail Test

```javascript
describe('API Response Guards', () => {
    it('validates success response shape', () => {
        const response = { success: true, data: {} };
        assert(response.success === true, 'Has success property');
        assert('data' in response, 'Has data property');
    });
    
    it('validates error response shape', () => {
        const response = { success: false, error: 'message' };
        assert(response.success === false, 'Has success property');
        assert('error' in response, 'Has error property');
    });
});
```

## Test Organization

### By Category

Tests are organized by what they guard:

- **API Tests** - API response validation
- **Utility Tests** - Utility function behavior
- **State Tests** - State management validation
- **Guardrail Tests** - General invariants

### Test Structure

```javascript
describe('Feature Name', () => {
    it('should validate expected behavior', () => {
        // Arrange
        const input = ...;
        
        // Act
        const result = functionUnderTest(input);
        
        // Assert
        assert(result.hasExpectedProperty, 'Has expected property');
    });
});
```

## Test Helpers

### Assertion Functions

From `test-helpers.js`:

```javascript
// Basic assertion
assert(condition, message);

// Equality check
assertEqual(actual, expected, message);

// Type check
assertType(value, expectedType, message);
```

### Test Utilities

- Minimal assertion library (no external dependencies)
- Simple test structure (`describe`, `it`, `assert`)
- Focus on shape/behavior validation, not implementation details

## Browser Tests

### State Manager Browser Tests

Some tests require browser environment:

- `state-manager-test.html` - Browser-based test page
- `run-state-tests.js` - Test runner for browser tests
- Tests DOM interactions and browser APIs

### Running Browser Tests

```bash
# Open in browser
open tests/state-manager-test.html

# Or use test runner
node tests/run-state-tests.js
```

## Test Coverage Philosophy

### What to Test

- **Critical contracts** - API response shapes, type contracts
- **Utility functions** - Core utility behavior
- **State invariants** - State structure and behavior
- **Breaking changes** - Tests that catch regressions

### What NOT to Test

- **Implementation details** - Don't test how, test what
- **UI rendering** - Not currently tested (may change)
- **Comprehensive coverage** - Not the goal (guardrails only)

## Test Patterns

### API Response Validation

```javascript
describe('API Response Guards', () => {
    it('validates all API responses match APIResponse<T>', () => {
        // Test that API functions return correct shape
    });
});
```

### Utility Function Tests

```javascript
describe('Utility Guards', () => {
    it('validates time formatting', () => {
        const result = formatTime(600);
        assert(result === '10:00', 'Formats time correctly');
    });
});
```

### State Shape Tests

```javascript
describe('State Guards', () => {
    it('validates state structure', () => {
        const state = getStateObject();
        assert('timerDuration' in state, 'Has timerDuration');
        assert(typeof state.timerDuration === 'number', 'timerDuration is number');
    });
});
```

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node tests/api-response-guards.test.js

# Run browser tests
node tests/run-state-tests.js
```

### Test Output

Tests output:
- Test suite name
- Test case results (pass/fail)
- Error messages for failures
- Summary of results

## Inconsistencies and Notes

### Current State

1. **Lightweight Testing** - Tests are guardrails, not comprehensive
2. **No Test Framework** - Uses custom minimal test helpers
3. **Browser Tests Separate** - Some tests require browser environment
4. **Limited Coverage** - Only critical invariants are tested

### Future Considerations

1. **Test Framework** - May adopt a test framework (Jest, Mocha, etc.) in future
2. **Coverage Expansion** - May add more comprehensive tests
3. **UI Testing** - May add UI/component tests
4. **Integration Tests** - May add integration tests for API flows

### Best Practices

1. **Keep Tests Simple** - Focus on invariants, not implementation
2. **Document Contracts** - Tests should document expected behavior
3. **Catch Breaking Changes** - Tests should fail when contracts break
4. **No External Dependencies** - Test helpers are self-contained (for now)

### Migration Notes

- Current tests are minimal and focused
- New tests should follow the guardrail pattern
- Consider adopting a test framework if tests grow

