/**
 * State Manager Test Runner
 * 
 * Run this from the browser console after the application has loaded.
 * 
 * Usage:
 * 1. Open the application in a browser
 * 2. Open the browser console (F12)
 * 3. Copy and paste the contents of this file into the console
 * 4. Or import this file as a module if running from a server
 */

export async function runStateManagerTests() {
    const { getState, setState, setTimerDuration, setCurrentTimer, resetTimerState, subscribe, getStateObject, initStateManager } = await import('../src/client/state/app-state.js');
    
    const results = [];
    let passed = 0;
    let failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            results.push({ name, status: 'pass' });
            passed++;
            console.log(`✓ ${name}`);
        } catch (error) {
            results.push({ name, status: 'fail', error: error.message });
            failed++;
            console.error(`✗ ${name}: ${error.message}`);
        }
    }
    
    function assert(condition, message) {
        if (!condition) throw new Error(message || 'Assertion failed');
    }
    
    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
    
    console.log('='.repeat(50));
    console.log('State Manager Test Suite');
    console.log('='.repeat(50));
    
    // Initialize (should already be done, but ensure it)
    initStateManager();
    
    // Run tests
    test('State initialized', () => {
        assert(getState('timerDuration') !== undefined, 'State should be initialized');
    });
    
    test('Default timer duration is 600', () => {
        assertEqual(getState('timerDuration'), 600);
    });
    
    test('Set non-persisted state', () => {
        setState('isTimerRunning', true, { persist: false });
        assertEqual(getState('isTimerRunning'), true);
        setState('isTimerRunning', false, { persist: false });
    });
    
    test('Set persisted state', () => {
        const original = getState('darkMode');
        setState('darkMode', true);
        assertEqual(getState('darkMode'), true);
        assertEqual(localStorage.getItem('bl_darkMode'), 'true');
        setState('darkMode', original); // Restore
    });
    
    test('setTimerDuration syncs currentTimer', () => {
        const original = getState('timerDuration');
        setTimerDuration(900);
        assertEqual(getState('timerDuration'), 900);
        assertEqual(getState('currentTimer'), 900);
        setTimerDuration(original); // Restore
    });
    
    test('State observer works', () => {
        let called = false;
        const unsub = subscribe('darkMode', () => { called = true; });
        const original = getState('darkMode');
        setState('darkMode', !original);
        assert(called, 'Observer should be called');
        setState('darkMode', original); // Restore
        unsub();
    });
    
    test('resetTimerState works', () => {
        setCurrentTimer(100);
        resetTimerState();
        assertEqual(getState('currentTimer'), getState('timerDuration'));
    });
    
    test('getStateObject returns copy', () => {
        const copy = getStateObject();
        const original = getState('timerDuration');
        copy.timerDuration = 9999;
        assertEqual(getState('timerDuration'), original);
    });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));
    
    return { passed, failed, results };
}

// Auto-run if imported as module
if (import.meta.url === `file://${window.location.pathname}` || window.location.protocol !== 'file:') {
    runStateManagerTests();
}

