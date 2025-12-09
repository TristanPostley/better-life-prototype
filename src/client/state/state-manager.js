/**
 * Unified State Manager
 * 
 * Provides centralized state management with:
 * - Single source of truth for all application state
 * - Automatic localStorage persistence
 * - State change observers/events
 * - State validation
 * 
 * @typedef {import('../../shared/types/state.js').AppState} AppState
 */

import { STORAGE_KEYS, TIMER } from '../../shared/constants.js';
import { handleError, ERROR_SEVERITY } from '../../shared/utils/error-handler.js';

/**
 * Application state - single source of truth
 * @type {AppState & {darkMode: boolean, fontFamily: string|null, lastSessionDate: string|null}}
 */
const state = {
    // Timer state
    timerDuration: TIMER.DEFAULT_DURATION,
    currentTimer: TIMER.DEFAULT_DURATION,
    timerInterval: null,
    isTimerRunning: false,
    
    // Menu state
    menuTitleTimeout: null,
    menuTitleHasBeenDismissed: false,
    
    // Drag state
    draggedBtn: null,
    offsetX: 0,
    offsetY: 0,
    wasDragged: false,
    
    
    // User preferences (synced with localStorage)
    darkMode: false,
    fontFamily: null,
    lastSessionDate: null
};

/**
 * State change observers
 * @type {Map<string, Set<(value: any, oldValue: any) => void>>}
 */
const observers = new Map();

/**
 * Properties that should be persisted to localStorage
 * @type {Set<string>}
 */
const persistedProperties = new Set([
    'timerDuration',
    'darkMode',
    'fontFamily',
    'lastSessionDate'
]);

/**
 * Subscribe to state changes
 * @param {string} property - Property name to observe
 * @param {(value: any, oldValue: any) => void} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(property, callback) {
    if (!observers.has(property)) {
        observers.set(property, new Set());
    }
    observers.get(property).add(callback);
    
    // Return unsubscribe function
    return () => {
        const propertyObservers = observers.get(property);
        if (propertyObservers) {
            propertyObservers.delete(callback);
        }
    };
}

/**
 * Notify observers of state change
 * @param {string} property - Property that changed
 * @param {*} newValue - New value
 * @param {*} oldValue - Old value
 * @returns {void}
 */
function notifyObservers(property, newValue, oldValue) {
    const propertyObservers = observers.get(property);
    if (propertyObservers) {
        propertyObservers.forEach(callback => {
            try {
                callback(newValue, oldValue);
            } catch (error) {
                handleError(error, {
                    severity: ERROR_SEVERITY.ERROR,
                    context: { module: 'state-manager.js', function: 'notifyObservers', data: { property } }
                });
            }
        });
    }
}

/**
 * Persist state to localStorage
 * @param {string} property - Property name
 * @param {*} value - Value to persist
 * @returns {void}
 */
function persistToStorage(property, value) {
    if (!persistedProperties.has(property)) return;
    
    try {
        const storageKey = getStorageKey(property);
        if (storageKey) {
            if (value === null || value === undefined) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(storageKey, String(value));
            }
        }
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'state-manager.js', function: 'persistToStorage', data: { property } }
        });
    }
}

/**
 * Get localStorage key for a property
 * @param {string} property - Property name
 * @returns {string|null} Storage key or null
 */
function getStorageKey(property) {
    const keyMap = {
        'timerDuration': STORAGE_KEYS.TIMER_DURATION,
        'darkMode': STORAGE_KEYS.DARK_MODE,
        'fontFamily': STORAGE_KEYS.FONT_FAMILY,
        'lastSessionDate': 'bl_lastDate'
    };
    return keyMap[property] || null;
}

/**
 * Load persisted state from localStorage
 * @returns {void}
 */
export function loadPersistedState() {
    // Load timer duration
    const storedDuration = localStorage.getItem(STORAGE_KEYS.TIMER_DURATION);
    if (storedDuration) {
        const duration = parseInt(storedDuration, 10);
        if (!isNaN(duration) && duration > 0) {
            state.timerDuration = duration;
            state.currentTimer = duration;
        }
    }
    
    // Load dark mode
    const storedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (storedDarkMode === 'true') {
        state.darkMode = true;
    }
    
    // Load font family
    const storedFont = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY);
    if (storedFont) {
        state.fontFamily = storedFont;
    }
    
    // Load last session date
    const storedLastDate = localStorage.getItem('bl_lastDate');
    if (storedLastDate) {
        state.lastSessionDate = storedLastDate;
    }
}

/**
 * Set a state property with validation and persistence
 * @param {string} property - Property name
 * @param {*} value - New value
 * @param {Object} options - Options
 * @param {boolean} [options.persist=true] - Whether to persist to localStorage
 * @param {boolean} [options.notify=true] - Whether to notify observers
 * @returns {boolean} True if value was set, false if validation failed
 */
export function setState(property, value, options = {}) {
    const { persist = true, notify = true } = options;
    
    // Validate property exists
    if (!(property in state)) {
        handleError(`Attempted to set unknown state property: ${property}`, {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'state-manager.js', function: 'setState', data: { property } }
        });
        return false;
    }
    
    const oldValue = state[property];
    
    // Validate value type matches
    // Allow null to be set to any type (null is a valid initial/reset value)
    // Allow any type to be set to null (null is a valid reset value)
    // Otherwise, check that types match
    if (oldValue !== null && value !== null && typeof oldValue !== typeof value) {
        handleError(`Type mismatch for ${property}: expected ${typeof oldValue}, got ${typeof value}`, {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'state-manager.js', function: 'setState', data: { property, expectedType: typeof oldValue, actualType: typeof value } }
        });
        // Allow but warn
    }
    
    // Set the value
    state[property] = value;
    
    // Persist if needed
    if (persist) {
        persistToStorage(property, value);
    }
    
    // Notify observers
    if (notify) {
        notifyObservers(property, value, oldValue);
    }
    
    return true;
}

/**
 * Get a state property
 * @param {string} property - Property name
 * @returns {*} Property value
 */
export function getState(property) {
    return state[property];
}

/**
 * Get the entire state object (read-only)
 * @returns {AppState} Current state
 */
export function getStateObject() {
    return { ...state }; // Return copy to prevent direct mutation
}

/**
 * Reset timer state to initial values
 * @returns {void}
 */
export function resetTimerState() {
    setState('currentTimer', state.timerDuration, { notify: true });
    setState('timerInterval', null, { persist: false, notify: false });
    setState('isTimerRunning', false, { persist: false, notify: true });
}

/**
 * Update timer duration and sync to currentTimer
 * @param {number} duration - New duration in seconds
 * @returns {void}
 */
export function setTimerDuration(duration) {
    if (typeof duration !== 'number' || duration < TIMER.MIN_DURATION) {
        handleError(`Invalid timer duration: ${duration}`, {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'state-manager.js', function: 'setTimerDuration', data: { duration } }
        });
        return;
    }
    
    setState('timerDuration', duration, { notify: true });
    setState('currentTimer', duration, { persist: false, notify: true });
}

/**
 * Update current timer value
 * @param {number} seconds - New timer value in seconds
 * @returns {void}
 */
export function setCurrentTimer(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        handleError(`Invalid current timer: ${seconds}`, {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'state-manager.js', function: 'setCurrentTimer', data: { seconds } }
        });
        return;
    }
    
    setState('currentTimer', seconds, { persist: false, notify: true });
}

/**
 * Initialize state manager
 * Loads persisted state from localStorage
 * @returns {void}
 */
export function initStateManager() {
    loadPersistedState();
    console.log('State manager initialized');
}

// Export state object for direct access (discouraged, but available for migration)
export { state };

