/**
 * Streak calculation and timer duration updates
 */

import { state } from '../shared/state/app-state.js';

/**
 * Update streak when session is completed
 */
export function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('bl_lastDate');

    if (lastDate !== today) {
        // It's a new day, reward the user
        state.timerDuration += (10 * 60); // Add 10 minutes
        state.currentTimer = state.timerDuration; // Update current timer too
        localStorage.setItem('bl_timerDuration', state.timerDuration);
        localStorage.setItem('bl_lastDate', today);
        console.log(`Streak updated! New duration: ${state.timerDuration / 60} mins`);
    } else {
        console.log('Already completed today. No extra time added.');
    }
}

