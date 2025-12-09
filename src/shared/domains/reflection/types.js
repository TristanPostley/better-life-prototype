/**
 * Reflection Domain Types
 */

/**
 * Reflection question type identifiers
 * @typedef {'better_today' | 'life_meaning'} QuestionType
 */

/**
 * Question response from database
 * @typedef {Object} Response
 * @property {string} id - UUID
 * @property {string} user_id - UUID
 * @property {QuestionType} question_type
 * @property {string} response_text
 * @property {string} created_at - ISO timestamp
 */

/**
 * Response creation payload
 * @typedef {Object} ResponseCreate
 * @property {string} user_id - UUID
 * @property {QuestionType} question_type
 * @property {string} response_text
 */

/**
 * LocalStorage history entry format
 * @typedef {Object} HistoryEntry
 * @property {string} date - ISO timestamp
 * @property {string} [betterToday] - Response to "better today" question
 * @property {string} [meaning] - Response to "life meaning" question
 */

