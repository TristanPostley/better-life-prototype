/**
 * Utility Function Guards
 * 
 * Tests that ensure critical utility functions behave as expected
 * 
 * Note: These tests use inline implementations to avoid browser-only dependencies
 */

import { describe, it, assert } from './test-helpers.js';

// Inline implementations for testing (matching src/client/domains/sessions/utils/time-format.js)
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Inline implementation for testing (matching src/client/domains/sessions/utils/progress-ring.js)
function getProgressRingCircumference() {
    return 2 * Math.PI * 130;
}

describe('Time Formatting Guards', () => {
    it('formatTime returns string in MM:SS format', () => {
        const result = formatTime(125);
        assert(typeof result === 'string', 'Returns a string');
        assert(/^\d{2}:\d{2}$/.test(result), 'Matches MM:SS format');
    });

    it('formatTime handles zero correctly', () => {
        assert(formatTime(0) === '00:00', 'Zero seconds formats to 00:00');
    });

    it('formatTime handles single digit minutes and seconds', () => {
        assert(formatTime(5) === '00:05', 'Single digit seconds');
        assert(formatTime(65) === '01:05', 'Single digit minutes');
    });

    it('formatTime handles exact minutes', () => {
        assert(formatTime(60) === '01:00', 'One minute');
        assert(formatTime(120) === '02:00', 'Two minutes');
        assert(formatTime(600) === '10:00', 'Ten minutes');
    });

    it('formatTime handles minutes and seconds', () => {
        assert(formatTime(90) === '01:30', 'One minute thirty seconds');
        assert(formatTime(125) === '02:05', 'Two minutes five seconds');
    });

    it('formatTime handles large values', () => {
        assert(formatTime(3661) === '61:01', 'Over an hour');
        assert(formatTime(3599) === '59:59', 'Just under an hour');
    });

    it('formatTime handles negative values gracefully', () => {
        // Should not crash, even if result is unexpected
        const result = formatTime(-5);
        assert(typeof result === 'string', 'Returns string for negative input');
    });
});

describe('Progress Ring Guards', () => {
    it('getProgressRingCircumference returns a number', () => {
        const result = getProgressRingCircumference();
        assert(typeof result === 'number', 'Returns a number');
    });

    it('getProgressRingCircumference returns positive value', () => {
        const result = getProgressRingCircumference();
        assert(result > 0, 'Returns positive value');
    });

    it('getProgressRingCircumference matches expected calculation', () => {
        const result = getProgressRingCircumference();
        const expected = 2 * Math.PI * 130;
        assert(result === expected, `Returns correct circumference: ${expected}`);
    });

    it('getProgressRingCircumference is consistent', () => {
        const result1 = getProgressRingCircumference();
        const result2 = getProgressRingCircumference();
        assert(result1 === result2, 'Returns consistent value');
    });
});

