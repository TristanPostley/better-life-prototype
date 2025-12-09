/**
 * Shared application state
 * 
 * This module manages the global state of the application.
 * Uses a state object that can be mutated.
 * 
 * @typedef {import('../../types/state.js').AppState} AppState
 */

// State object that can be mutated
/** @type {AppState} */
export const state = {
    // Timer state
    timerDuration: 10 * 60, // 10 minutes in seconds
    currentTimer: 10 * 60,
    timerInterval: null,
    isTimerRunning: false,
    
    // Menu state
    menuTitleTimeout: null,
    menuTitleHasBeenDismissed: false, // Track if title has been faded out
    
    // Drag state
    draggedBtn: null,
    offsetX: 0,
    offsetY: 0,
    wasDragged: false,
    
};

/**
 * Reset timer state to initial values
 * @returns {void}
 */
export function resetTimerState() {
    state.currentTimer = state.timerDuration;
    state.timerInterval = null;
    state.isTimerRunning = false;
}

