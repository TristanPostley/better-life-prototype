/**
 * Shared application state
 * 
 * This module manages the global state of the application.
 * Uses a state object that can be mutated.
 */

// State object that can be mutated
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
    
    // Triangle state
    triangleRotation: 0 // Store current rotation
};

/**
 * Reset timer state to initial values
 */
export function resetTimerState() {
    state.currentTimer = state.timerDuration;
    state.timerInterval = null;
    state.isTimerRunning = false;
}

