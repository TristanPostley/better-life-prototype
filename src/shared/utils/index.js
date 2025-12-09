/**
 * Shared utility functions
 * 
 * Common utility functions used across inline scripts and modules
 */

/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + String(secs).padStart(2, '0');
}

/**
 * Parse a time string (MM:SS) into seconds
 * @param {string} timeString - Time string in MM:SS format
 * @returns {number} Time in seconds, or 0 if invalid
 */
export function parseTime(timeString) {
    if (!timeString || typeof timeString !== 'string') {
        return 0;
    }
    
    const parts = timeString.split(':');
    if (parts.length !== 2) {
        return 0;
    }
    
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    
    return (mins * 60) + secs;
}

/**
 * Calculate progress ring offset based on current timer and total duration
 * @param {number} currentTimer - Current timer value in seconds
 * @param {number} totalDuration - Total timer duration in seconds
 * @param {number} radius - Circle radius in pixels (default 130)
 * @returns {number} Stroke dash offset value
 */
export function calculateProgressRingOffset(currentTimer, totalDuration, radius = 130) {
    const progress = currentTimer / totalDuration;
    const circumference = 2 * Math.PI * radius;
    return circumference * (1 - progress);
}

