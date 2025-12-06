/**
 * Data persistence and loading
 */

import { state } from '../shared/state/app-state.js';

/**
 * Load user data from localStorage
 */
export function loadUserData() {
    const storedDuration = localStorage.getItem('bl_timerDuration');
    const lastDate = localStorage.getItem('bl_lastDate');

    // Default 10 minutes
    if (storedDuration) {
        const duration = parseInt(storedDuration, 10);
        state.timerDuration = duration;
        state.currentTimer = duration;
    }

    // Check for missed days
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

