/**
 * Timer logic and controls
 * 
 * @typedef {import('../../src/types/dom.js').DOMElements} DOMElements
 * @typedef {import('../../src/types/state.js').AppState} AppState
 */

import { formatTime } from './utils/time-format.js';
import { getProgressRingCircumference } from './utils/progress-ring.js';
import { getDOMElements } from '../../src/shared/utils/dom-elements.js';
import { state } from '../../src/shared/state/app-state.js';
import { waitForTransition } from '../../src/shared/utils/transitions.js';
import { CSS_CLASSES, TRANSITION_TIMEOUTS } from '../../src/shared/constants.js';

let circumference = null;
let dom = null;

/**
 * Initialize timer module
 * @returns {void}
 */
export function initTimer() {
    dom = getDOMElements();
    circumference = getProgressRingCircumference();
    
    // Initialize progress ring (if it exists)
    if (dom.display.progressRing) {
        dom.display.progressRing.style.strokeDasharray = circumference;
    }
}

/**
 * Reset timer display to initial state
 * @returns {void}
 */
export function resetTimerDisplay() {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.display) {
        console.error('Cannot reset timer display: DOM elements not available');
        return;
    }
    
    state.currentTimer = state.timerDuration;
    if (dom.display.timer) {
        dom.display.timer.textContent = formatTime(state.currentTimer);
    }
    if (dom.display.circleTime) {
        dom.display.circleTime.textContent = formatTime(state.currentTimer);
    }

    // Reset the view to show intro, hide circle
    dom.display.timerIntro.classList.remove(CSS_CLASSES.FADE_OUT);
    dom.display.circleTimer.classList.add(CSS_CLASSES.HIDDEN);
    dom.display.circleTimer.classList.remove(CSS_CLASSES.SHOW);

    // Reset progress ring
    if (dom.display.progressRing) {
        dom.display.progressRing.style.strokeDashoffset = 0;
    }
}

/**
 * Update the progress ring visual indicator
 * @returns {void}
 */
export function updateProgressRing() {
    if (!dom.display.progressRing) return;
    const progress = state.currentTimer / state.timerDuration;
    const offset = circumference * (1 - progress);
    dom.display.progressRing.style.strokeDashoffset = offset;
}

/**
 * Start the timer countdown
 * @returns {void}
 */
export function startTimer() {
    state.isTimerRunning = true;
    state.timerInterval = setInterval(() => {
        state.currentTimer--;
        dom.display.timer.textContent = formatTime(state.currentTimer);
        dom.display.circleTime.textContent = formatTime(state.currentTimer);
        updateProgressRing();

            if (state.currentTimer <= 0) {
                pauseTimer();
                // Call the global finishSession function set by app.js
                if (window.finishSession) {
                    window.finishSession();
                }
            }
    }, 1000);
}

/**
 * Pause the timer
 * @returns {void}
 */
export function pauseTimer() {
    state.isTimerRunning = false;
    clearInterval(state.timerInterval);
}

/**
 * Finish the current session
 * Calls the global finishSession function if available
 * @returns {void}
 */
export function finishSession() {
    pauseTimer();
    // Call the global finishSession function set by app.js
    if (window.finishSession) {
        window.finishSession();
    }
}

/**
 * Handle start timer button click
 * @returns {Promise<void>}
 */
export async function handleStartTimerClick() {
    console.log('handleStartTimerClick called');
    // Fade out intro, fade in circle timer
    dom.display.timerIntro.classList.add(CSS_CLASSES.FADE_OUT);
    
    // Wait for intro fade-out to complete
    await waitForTransition(dom.display.timerIntro, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
    
    // Show circle timer
    dom.display.circleTimer.classList.remove(CSS_CLASSES.HIDDEN);

    // Force reflow then show
    void dom.display.circleTimer.offsetWidth;
    dom.display.circleTimer.classList.add(CSS_CLASSES.SHOW);

    // Initialize circle timer display
    dom.display.circleTime.textContent = formatTime(state.currentTimer);
    updateProgressRing();

    // Wait for circle timer fade-in
    await waitForTransition(dom.display.circleTimer, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);

    // Start the timer
    startTimer();
}

/**
 * Handle circle wrapper click (pause/resume)
 * @returns {void}
 */
export function handleCircleClick() {
    if (state.isTimerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

/**
 * Get current timer value
 * @returns {number} Current timer value in seconds
 */
export function getCurrentTimer() {
    return state.currentTimer;
}

/**
 * Set timer display (for debug purposes)
 * @param {number} seconds - Timer value in seconds
 * @returns {boolean} True if timer reached zero
 */
export function setTimerDisplay(seconds) {
    state.currentTimer = Math.max(0, seconds);
    dom.display.timer.textContent = formatTime(state.currentTimer);
    dom.display.circleTime.textContent = formatTime(state.currentTimer);
    updateProgressRing();
    
    return state.currentTimer <= 0;
}

