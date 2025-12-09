/**
 * Sessions Domain Types
 */

/**
 * Completed focus session from database
 * @typedef {Object} Session
 * @property {string} id - UUID
 * @property {string} user_id - UUID
 * @property {string} completed_at - ISO timestamp
 * @property {number} duration_seconds
 * @property {string|null} journal_entry
 * @property {string} created_at - ISO timestamp
 */

/**
 * Session creation payload
 * @typedef {Object} SessionCreate
 * @property {string} user_id - UUID
 * @property {number} duration_seconds
 * @property {string|null} [journal_entry]
 */

