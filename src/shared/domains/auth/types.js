/**
 * Auth Domain Types
 */

/**
 * Authentication result
 * @typedef {Object} AuthResult
 * @property {boolean} success
 * @property {Object|null} [user] - User object from Supabase auth
 * @property {string} [message] - Success message
 * @property {string} [error] - Error message
 */

/**
 * Auth state changed event detail
 * @typedef {Object} AuthStateChangedEventDetail
 * @property {string} event - Auth event type
 * @property {Object|null} user - Current user object
 * @property {boolean} authenticated - Whether user is authenticated
 */

/**
 * Auth form type identifiers
 * @typedef {'signup' | 'signin' | 'magic-link' | 'reset-password'} AuthFormType
 */

