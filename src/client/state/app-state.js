/**
 * Application state (unified state management)
 * 
 * This module provides unified state management with automatic persistence
 * and state change observers. The state object is exported for backward
 * compatibility, but new code should use the state manager functions.
 * 
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

// Re-export state from state-manager for backward compatibility
import { state, initStateManager } from './state-manager.js';

// Initialize state manager on module load
initStateManager();

// Export state object (for backward compatibility)
export { state };

// Export state manager functions
export { 
    getState, 
    setState, 
    getStateObject, 
    subscribe,
    resetTimerState,
    setTimerDuration,
    setCurrentTimer,
    initStateManager
} from './state-manager.js';


