/**
 * Application-wide constants
 * 
 * Centralizes all magic values used throughout the application
 * to improve maintainability and reduce errors.
 */

/**
 * Timer-related constants
 */
export const TIMER = {
    /** Default timer duration in seconds (10 minutes) */
    DEFAULT_DURATION: 600,
    /** Minimum timer duration in seconds (1 minute) */
    MIN_DURATION: 60,
    /** Timer increment/decrement in seconds (10 minutes) */
    INCREMENT: 600,
    /** Progress ring radius in pixels */
    PROGRESS_RING_RADIUS: 130,
    /** Update interval in milliseconds */
    UPDATE_INTERVAL: 1000
};

/**
 * CSS class names used throughout the application
 */
export const CSS_CLASSES = {
    /** Hidden element class */
    HIDDEN: 'hidden',
    /** Active page class */
    ACTIVE_PAGE: 'active-page',
    /** Fade-in animation class */
    FADE_IN: 'fade-in',
    /** Fade-out animation class */
    FADE_OUT: 'fade-out',
    /** Scrollable body class */
    SCROLLABLE: 'scrollable',
    /** Show element class */
    SHOW: 'show',
    /** Dragging state class */
    DRAGGING: 'dragging',
    /** Dark mode class */
    DARK_MODE: 'dark-mode'
};

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
    /** Timer duration preference */
    TIMER_DURATION: 'bl_timerDuration',
    /** Dark mode preference */
    DARK_MODE: 'bl_darkMode',
    /** Font family preference */
    FONT_FAMILY: 'bl_fontFamily'
};

/**
 * Page identifiers
 */
export const PAGES = {
    LANDING: 'landing',
    TIMER: 'timer',
    MENU: 'menu'
};

/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION_DELAYS = {
    /** Delay before showing journal tab */
    JOURNAL_REVEAL: 3000,
    /** Delay for button fade-in */
    BUTTON_FADE_IN: 100,
    /** Delay for title fade-out */
    TITLE_FADE_OUT: 5000,
};

/**
 * Transition duration constants (in milliseconds)
 */
export const TRANSITION_DURATIONS = {
    /** Fast transition (200ms) */
    FAST: 200,
    /** Normal transition (400ms) - standard for most fades */
    NORMAL: 400,
    /** Slow transition (500ms) - for complex animations */
    SLOW: 500
};

/**
 * Transition timeout fallback values (in milliseconds)
 */
export const TRANSITION_TIMEOUTS = {
    /** Default fallback timeout if transition events don't fire */
    DEFAULT: 2000,
    /** Short timeout for quick transitions */
    SHORT: 1000,
    /** Long timeout for complex animations */
    LONG: 3000
};

