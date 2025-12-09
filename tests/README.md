# Guardrail Tests

Light tests that enforce critical invariants in the codebase. These are not comprehensive test suites—just safety checks to catch breaking changes.

## What These Tests Guard

1. **API Response Shapes** - Ensures all API responses match the unified `APIResponse<T>` type
2. **Utility Functions** - Verifies critical utils (time formatting, calculations) behave correctly
3. **State Shapes** - Documents expected state structure

## Running Tests

```bash
npm test
```

Or directly:

```bash
node tests/run-tests.js
```

## Test Structure

- `test-helpers.js` - Minimal assertion library (no external dependencies)
- `api-response-guards.test.js` - API response shape validation
- `utils-guards.test.js` - Utility function behavior checks
- `guardrails.test.js` - State shape documentation
- `run-tests.js` - Test runner

## Adding New Guardrail Tests

When adding new invariants to guard:

1. Add test to appropriate test file
2. Use the `describe`, `it`, and `assert` helpers
3. Keep tests simple and focused on shape/behavior validation
4. Don't test implementation details—only contracts

Example:

```javascript
describe('New Feature Guards', () => {
    it('validates expected shape', () => {
        const result = someFunction();
        assert(result.hasRequiredProperty, 'Has required property');
    });
});
```

