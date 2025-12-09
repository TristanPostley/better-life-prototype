/**
 * Users Domain Types
 */

/**
 * User profile from database
 * @typedef {Object} Profile
 * @property {string} id - UUID
 * @property {string|null} email
 * @property {string|null} display_name
 * @property {string} created_at - ISO timestamp
 * @property {number} timer_duration - Duration in seconds (default: 600)
 * @property {string|null} last_session_date - Date string
 * @property {string} updated_at - ISO timestamp
 */

/**
 * Profile update payload (partial profile)
 * @typedef {Object} ProfileUpdate
 * @property {string} [email]
 * @property {string} [display_name]
 * @property {number} [timer_duration]
 * @property {string} [last_session_date]
 */

/**
 * Font configuration
 * @typedef {Object} Font
 * @property {string} name - Display name
 * @property {string} value - CSS font-family value
 */

