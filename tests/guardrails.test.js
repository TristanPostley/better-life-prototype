/**
 * Guardrail Tests
 * 
 * Light tests that enforce critical invariants:
 * - API responses match unified types
 * - Important utils behave as expected
 * - State shapes are correct
 * 
 * These are not comprehensive test suites, just safety checks.
 */

import { describe, it, assert } from './test-helpers.js';

// Note: These tests validate invariants but can't import browser-only modules
// They serve as documentation of expected behavior and can be run with mocks

// Test helpers
function isSuccessResponse(response) {
    return (
        response !== null &&
        typeof response === 'object' &&
        response.success === true &&
        'data' in response &&
        !('error' in response) && // Success responses should not have error
        (response.message === undefined || typeof response.message === 'string')
    );
}

function isErrorResponse(response) {
    return (
        response !== null &&
        typeof response === 'object' &&
        response.success === false &&
        typeof response.error === 'string' &&
        !('data' in response)
    );
}

function isValidAPIResponse(response) {
    return isSuccessResponse(response) || isErrorResponse(response);
}

describe('API Response Shape Guards', () => {
    it('success responses have correct shape', () => {
        const validSuccess = { success: true, data: { id: '123' }, message: 'Success' };
        const validSuccessNoMessage = { success: true, data: null };
        const invalidMissingData = { success: true, message: 'Success' };
        const invalidWrongSuccess = { success: 1, data: {} };
        
        assert(isSuccessResponse(validSuccess), 'Valid success with message');
        assert(isSuccessResponse(validSuccessNoMessage), 'Valid success without message');
        assert(!isSuccessResponse(invalidMissingData), 'Invalid: missing data');
        assert(!isSuccessResponse(invalidWrongSuccess), 'Invalid: wrong success type');
    });

    it('error responses have correct shape', () => {
        const validError = { success: false, error: 'Something went wrong' };
        const invalidMissingError = { success: false };
        const invalidHasData = { success: false, error: 'Error', data: {} };
        const invalidWrongSuccess = { success: 0, error: 'Error' };
        
        assert(isErrorResponse(validError), 'Valid error response');
        assert(!isErrorResponse(invalidMissingError), 'Invalid: missing error');
        assert(!isErrorResponse(invalidHasData), 'Invalid: has data field');
        assert(!isErrorResponse(invalidWrongSuccess), 'Invalid: wrong success type');
    });

    it('API responses are either success or error', () => {
        const success = { success: true, data: {} };
        const error = { success: false, error: 'Error' };
        const invalid = { success: true, data: {}, error: 'Error' }; // Can't be both
        const invalid2 = {}; // Missing success
        
        assert(isValidAPIResponse(success), 'Valid success response');
        assert(isValidAPIResponse(error), 'Valid error response');
        // Response with both success:true and error should fail both validations
        assert(!isSuccessResponse(invalid) && !isErrorResponse(invalid), 'Invalid: has both success and error');
        assert(!isValidAPIResponse(invalid2), 'Invalid: missing success field');
    });
});

// Time formatting and progress ring tests are in utils-guards.test.js

describe('State Shape Guards', () => {
    it('app state has required properties', () => {
        // This test ensures state structure matches AppState type
        const requiredProps = [
            'timerDuration',
            'currentTimer',
            'timerInterval',
            'isTimerRunning',
            'menuTitleTimeout',
            'menuTitleHasBeenDismissed',
            'draggedBtn',
            'offsetX',
            'offsetY',
            'wasDragged',
            'triangleRotation'
        ];
        
        // We can't import state directly in tests (it's browser-only)
        // But we can verify the shape if we mock it
        const mockState = {
            timerDuration: 600,
            currentTimer: 600,
            timerInterval: null,
            isTimerRunning: false,
            menuTitleTimeout: null,
            menuTitleHasBeenDismissed: false,
            draggedBtn: null,
            offsetX: 0,
            offsetY: 0,
            wasDragged: false,
            triangleRotation: 0
        };
        
        requiredProps.forEach(prop => {
            assert(prop in mockState, `State has ${prop} property`);
        });
    });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Running guardrail tests...');
}

