/**
 * Global API Response Types
 */

/**
 * Success response with data
 * @template T
 * @typedef {Object} SuccessResponse
 * @property {true} success
 * @property {T} data
 * @property {string} [message] - Optional success message
 */

/**
 * Error response
 * @typedef {Object} ErrorResponse
 * @property {false} success
 * @property {string} error - Error message
 */

/**
 * Standard API response pattern
 * @template T
 * @typedef {SuccessResponse<T> | ErrorResponse} APIResponse
 */

