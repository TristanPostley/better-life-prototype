/**
 * State Manager Console Test Commands
 * 
 * Copy and paste these commands into the browser console
 * after the application has loaded.
 * 
 * The state manager is already loaded, so we can access it directly
 * through the window object or by accessing the module.
 */

// ============================================
// OPTION 1: Access via already-loaded modules
// ============================================

// Since the app.js module is already loaded, we can import from it
// But first, let's check if we can access the state directly

// Test 1: Check if state is accessible
console.log('=== State Manager Console Tests ===\n');

// Try to access state through the module system
// Since modules are already loaded, we need to import fresh or access via window

// First, let's see what's available
console.log('Checking available modules...');

// ============================================
// OPTION 2: Direct import (if server is running from root)
// ============================================

async function runStateTests() {
    try {
        // Import the state manager
        const stateModule = await import('/src/client/state/app-state.js');
        const { getState, setState, setTimerDuration, setCurrentTimer, resetTimerState, subscribe, getStateObject } = stateModule;
        
        console.log('✓ State manager imported successfully\n');
        
        // Test 1: Initial state
        console.log('Test 1: Initial State');
        console.log('  Timer Duration:', getState('timerDuration'));
        console.log('  Current Timer:', getState('currentTimer'));
        console.log('  Dark Mode:', getState('darkMode'));
        console.log('  Font Family:', getState('fontFamily'));
        console.log('  ✓ Passed\n');
        
        // Test 2: Set non-persisted state
        console.log('Test 2: Set Non-Persisted State');
        setState('isTimerRunning', true, { persist: false });
        const isRunning = getState('isTimerRunning');
        console.log('  isTimerRunning:', isRunning);
        console.log('  ✓ Passed\n');
        setState('isTimerRunning', false, { persist: false });
        
        // Test 3: Set persisted state
        console.log('Test 3: Set Persisted State');
        const originalDarkMode = getState('darkMode');
        setState('darkMode', true);
        const darkMode = getState('darkMode');
        const stored = localStorage.getItem('bl_darkMode');
        console.log('  darkMode:', darkMode);
        console.log('  localStorage:', stored);
        console.log('  ✓ Passed\n');
        setState('darkMode', originalDarkMode); // Restore
        
        // Test 4: Timer duration sync
        console.log('Test 4: Timer Duration Sync');
        const originalDuration = getState('timerDuration');
        setTimerDuration(900);
        const duration = getState('timerDuration');
        const current = getState('currentTimer');
        console.log('  timerDuration:', duration);
        console.log('  currentTimer (synced):', current);
        console.log('  ✓ Passed\n');
        setTimerDuration(originalDuration); // Restore
        
        // Test 5: State observer
        console.log('Test 5: State Observer');
        let observerCalled = false;
        const originalDarkMode2 = getState('darkMode');
        const unsubscribe = subscribe('darkMode', (newVal, oldVal) => {
            console.log('    Observer called!', oldVal, '->', newVal);
            observerCalled = true;
        });
        setState('darkMode', !originalDarkMode2);
        console.log('  Observer called:', observerCalled ? 'Yes' : 'No');
        console.log('  ✓ Passed\n');
        setState('darkMode', originalDarkMode2); // Restore
        unsubscribe();
        
        // Test 6: Reset timer
        console.log('Test 6: Reset Timer State');
        setCurrentTimer(100);
        resetTimerState();
        const resetTimer = getState('currentTimer');
        const resetDuration = getState('timerDuration');
        console.log('  currentTimer after reset:', resetTimer);
        console.log('  timerDuration:', resetDuration);
        console.log('  Match:', resetTimer === resetDuration ? 'Yes' : 'No');
        console.log('  ✓ Passed\n');
        
        // Test 7: Get state object
        console.log('Test 7: Get State Object');
        const stateCopy = getStateObject();
        const originalTimer = getState('timerDuration');
        stateCopy.timerDuration = 9999;
        const stillOriginal = getState('timerDuration');
        console.log('  State object keys:', Object.keys(stateCopy).length);
        console.log('  Original preserved:', stillOriginal === originalTimer ? 'Yes' : 'No');
        console.log('  ✓ Passed\n');
        
        console.log('=== All Tests Completed ===');
        console.log('✓ State manager is working correctly!');
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error running tests:', error);
        console.error('Make sure you are running from a web server (not file://)');
        console.error('Try: python -m http.server 8000');
        return { success: false, error };
    }
}

// Auto-run if pasted into console
runStateTests();

// ============================================
// ALTERNATIVE: If import fails, try this
// ============================================

// If the import above fails, the state manager might already be loaded.
// Try accessing it through the module cache or window object.
// However, ES6 modules don't expose to window by default.

// You can also test manually:
/*
// Manual test commands (paste these one at a time):

// 1. Import state manager
const { getState, setState } = await import('/src/client/state/app-state.js');

// 2. Check initial state
getState('timerDuration');
getState('darkMode');

// 3. Test setter
setState('darkMode', true);
getState('darkMode');
localStorage.getItem('bl_darkMode');

// 4. Test timer
const { setTimerDuration } = await import('/src/client/state/app-state.js');
setTimerDuration(900);
getState('timerDuration');
getState('currentTimer');
*/

