/**
 * Timer logic and controls
 */

import { formatTime } from '../utils/time.js';
import { getDOMElements, getProgressRingCircumference } from '../utils/dom.js';
import { state } from '../state/app-state.js';

let circumference = null;
let dom = null;

/**
 * Initialize timer module
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
    dom.display.timerIntro.classList.remove('fade-out');
    dom.display.circleTimer.classList.add('hidden');
    dom.display.circleTimer.classList.remove('show');

    // Reset progress ring
    if (dom.display.progressRing) {
        dom.display.progressRing.style.strokeDashoffset = 0;
    }
}

/**
 * Update the progress ring visual indicator
 */
export function updateProgressRing() {
    if (!dom.display.progressRing) return;
    const progress = state.currentTimer / state.timerDuration;
    const offset = circumference * (1 - progress);
    dom.display.progressRing.style.strokeDashoffset = offset;
}

/**
 * Start the timer countdown
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
 */
export function pauseTimer() {
    state.isTimerRunning = false;
    clearInterval(state.timerInterval);
}

/**
 * Finish the current session
 * Calls the global finishSession function if available
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
 */
export function handleStartTimerClick() {
    console.log('handleStartTimerClick called');
    // Fade out intro, fade in circle timer
    dom.display.timerIntro.classList.add('fade-out');
    dom.display.circleTimer.classList.remove('hidden');

    // Force reflow then show
    void dom.display.circleTimer.offsetWidth;
    dom.display.circleTimer.classList.add('show');

    // Initialize circle timer display
    dom.display.circleTime.textContent = formatTime(state.currentTimer);
    updateProgressRing();

    // Start the timer
    startTimer();
}

/**
 * Handle circle wrapper click (pause/resume)
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
 */
export function getCurrentTimer() {
    return state.currentTimer;
}

/**
 * Set timer display (for debug purposes)
 */
export function setTimerDisplay(seconds) {
    state.currentTimer = Math.max(0, seconds);
    dom.display.timer.textContent = formatTime(state.currentTimer);
    dom.display.circleTime.textContent = formatTime(state.currentTimer);
    updateProgressRing();
    
    return state.currentTimer <= 0;
}

