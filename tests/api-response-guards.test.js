/**
 * API Response Shape Guards
 * 
 * Tests that ensure all API functions return responses matching
 * the unified APIResponse<T> type from src/shared/types/api.js
 */

import { describe, it, assert } from './test-helpers.js';

/**
 * Validates a success response matches SuccessResponse<T>
 * @param {any} response
 * @returns {boolean}
 */
function isValidSuccessResponse(response) {
    if (!response || typeof response !== 'object') return false;
    if (response.success !== true) return false;
    if (!('data' in response)) return false;
    if ('error' in response) return false; // Success responses should not have error
    if (response.message !== undefined && typeof response.message !== 'string') return false;
    return true;
}

/**
 * Validates an error response matches ErrorResponse
 * @param {any} response
 * @returns {boolean}
 */
function isValidErrorResponse(response) {
    if (!response || typeof response !== 'object') return false;
    if (response.success !== false) return false;
    if (typeof response.error !== 'string') return false;
    if ('data' in response) return false; // Error responses should not have data
    return true;
}

/**
 * Validates response matches APIResponse<T> pattern
 * @param {any} response
 * @returns {boolean}
 */
function isValidAPIResponse(response) {
    return isValidSuccessResponse(response) || isValidErrorResponse(response);
}

describe('API Response Type Guards', () => {
    describe('SuccessResponse<T> validation', () => {
        it('accepts valid success response with data and message', () => {
            const response = {
                success: true,
                data: { id: '123', name: 'Test' },
                message: 'Operation successful'
            };
            assert(isValidSuccessResponse(response), 'Valid success with data and message');
        });

        it('accepts valid success response with data only', () => {
            const response = {
                success: true,
                data: null
            };
            assert(isValidSuccessResponse(response), 'Valid success with null data');
        });

        it('rejects success response without data field', () => {
            const response = {
                success: true,
                message: 'Success'
            };
            assert(!isValidSuccessResponse(response), 'Invalid: missing data field');
        });

        it('rejects success response with non-boolean success', () => {
            const response = {
                success: 1,
                data: {}
            };
            assert(!isValidSuccessResponse(response), 'Invalid: success is not boolean true');
        });

        it('rejects success response with non-string message', () => {
            const response = {
                success: true,
                data: {},
                message: 123
            };
            assert(!isValidSuccessResponse(response), 'Invalid: message is not string');
        });
    });

    describe('ErrorResponse validation', () => {
        it('accepts valid error response', () => {
            const response = {
                success: false,
                error: 'Something went wrong'
            };
            assert(isValidErrorResponse(response), 'Valid error response');
        });

        it('rejects error response without error field', () => {
            const response = {
                success: false
            };
            assert(!isValidErrorResponse(response), 'Invalid: missing error field');
        });

        it('rejects error response with data field', () => {
            const response = {
                success: false,
                error: 'Error',
                data: {}
            };
            assert(!isValidErrorResponse(response), 'Invalid: error response has data');
        });

        it('rejects error response with non-string error', () => {
            const response = {
                success: false,
                error: 123
            };
            assert(!isValidErrorResponse(response), 'Invalid: error is not string');
        });

        it('rejects error response with non-boolean success', () => {
            const response = {
                success: 0,
                error: 'Error'
            };
            assert(!isValidErrorResponse(response), 'Invalid: success is not boolean false');
        });
    });

    describe('APIResponse<T> union validation', () => {
        it('accepts valid success response', () => {
            const response = { success: true, data: {} };
            assert(isValidAPIResponse(response), 'Valid success response');
        });

        it('accepts valid error response', () => {
            const response = { success: false, error: 'Error' };
            assert(isValidAPIResponse(response), 'Valid error response');
        });

    it('rejects response with both success and error', () => {
        const response = { success: true, data: {}, error: 'Error' };
        assert(!isValidAPIResponse(response), 'Invalid: has both success and error');
    });

        it('rejects response missing success field', () => {
            const response = { data: {} };
            assert(!isValidAPIResponse(response), 'Invalid: missing success field');
        });

        it('rejects null or undefined', () => {
            assert(!isValidAPIResponse(null), 'Invalid: null');
            assert(!isValidAPIResponse(undefined), 'Invalid: undefined');
        });
    });
});

