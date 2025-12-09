/**
 * Data persistence and loading
 * 
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

import { setTimerDuration, getState, setState } from '../../state/app-state.js';
import { STORAGE_KEYS, TIMER } from '../../../shared/constants.js';

/**
 * Load user data from localStorage
 * 
 * Note: State manager automatically loads persisted state on initialization.
 * This function is kept for backward compatibility and additional processing.
 * @returns {void}
 */
export function loadUserData() {
    // State manager already loaded persisted state, but we can do additional processing here
    const lastDate = getState('lastSessionDate');

    // Check for missed days (future enhancement)
    if (lastDate) {
        const today = new Date();
        const last = new Date(lastDate);
        const diffTime = Math.abs(today - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If it's been more than 2 days since last session (e.g. played Monday, now Wednesday = missed Tuesday)
        // We apply a penalty. To avoid re-applying on refresh, we rely on a separate 'lastPenalty' flag or just accept the limitation for now.
        // For this prototype, we will skip the complex date math penalty to avoid bugs, 
        // and focus on the "Increase" reward which is safer.
    }
}

