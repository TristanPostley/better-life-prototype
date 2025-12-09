/**
 * Streak calculation and timer duration updates
 * 
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

import { getState, setTimerDuration, setState } from '../../state/app-state.js';
import { TIMER } from '../../../shared/constants.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

/**
 * Update streak when session is completed
 * @returns {void}
 */
export function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = getState('lastSessionDate');

    if (lastDate !== today) {
        // It's a new day, reward the user
        const currentDuration = getState('timerDuration');
        const newDuration = currentDuration + TIMER.INCREMENT;
        
        // Update timer duration (automatically persists and syncs currentTimer)
        setTimerDuration(newDuration);
        
        // Update last session date (automatically persists)
        setState('lastSessionDate', today);
    }
}

