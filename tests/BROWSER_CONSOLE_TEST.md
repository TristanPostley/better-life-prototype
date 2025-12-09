# Browser Console Test Instructions

## The Problem

When importing modules from the browser console, you need to use **absolute paths** starting with `/` (not relative paths like `./`).

## Solution: Use Absolute Paths

Since your server is running from the project root, use absolute paths from the root:

### ✅ Correct Import Path

```javascript
const { getState, setState } = await import('/src/client/state/app-state.js');
```

### ❌ Wrong Import Path

```javascript
// This won't work from console
const { getState, setState } = await import('./src/client/state/app-state.js');
```

## Quick Test Commands

Copy and paste this into your browser console:

```javascript
// Import state manager
const stateModule = await import('/src/client/state/app-state.js');
const { getState, setState, setTimerDuration, setCurrentTimer, resetTimerState, subscribe, getStateObject } = stateModule;

// Test 1: Check initial state
console.log('Timer Duration:', getState('timerDuration'));
console.log('Current Timer:', getState('currentTimer'));
console.log('Dark Mode:', getState('darkMode'));

// Test 2: Set state
setState('darkMode', true);
console.log('Dark Mode set:', getState('darkMode'));
console.log('localStorage:', localStorage.getItem('bl_darkMode'));

// Test 3: Timer sync
setTimerDuration(900);
console.log('Timer Duration:', getState('timerDuration'));
console.log('Current Timer (synced):', getState('currentTimer'));

// Test 4: State observer
let called = false;
const unsubscribe = subscribe('darkMode', (newVal, oldVal) => {
    console.log('Observer called!', oldVal, '->', newVal);
    called = true;
});
setState('darkMode', false);
console.log('Observer test:', called ? 'PASSED' : 'FAILED');
unsubscribe();

// Test 5: Reset timer
setCurrentTimer(100);
resetTimerState();
console.log('Timer reset. currentTimer:', getState('currentTimer'));

// Test 6: Get state object
const stateCopy = getStateObject();
console.log('State object:', Object.keys(stateCopy).length, 'properties');
```

## Full Test Suite

For a complete automated test, copy the contents of `tests/console-test-commands.js` into your browser console.

Or run this one-liner:

```javascript
// Full automated test
(async () => {
    const { getState, setState, setTimerDuration, setCurrentTimer, resetTimerState, subscribe, getStateObject } = await import('/src/client/state/app-state.js');
    let passed = 0, failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
            passed++;
        } catch (e) {
            console.error(`✗ ${name}: ${e.message}`);
            failed++;
        }
    }
    
    test('State initialized', () => getState('timerDuration') !== undefined);
    test('Default timer is 600', () => getState('timerDuration') === 600);
    test('Set non-persisted state', () => {
        setState('isTimerRunning', true, { persist: false });
        return getState('isTimerRunning') === true;
    });
    test('Set persisted state', () => {
        setState('darkMode', true);
        return getState('darkMode') === true && localStorage.getItem('bl_darkMode') === 'true';
    });
    test('Timer duration syncs', () => {
        const orig = getState('timerDuration');
        setTimerDuration(900);
        const result = getState('timerDuration') === 900 && getState('currentTimer') === 900;
        setTimerDuration(orig);
        return result;
    });
    test('State observer works', () => {
        let called = false;
        const unsub = subscribe('darkMode', () => { called = true; });
        const orig = getState('darkMode');
        setState('darkMode', !orig);
        setState('darkMode', orig);
        unsub();
        return called;
    });
    test('Reset timer works', () => {
        setCurrentTimer(100);
        resetTimerState();
        return getState('currentTimer') === getState('timerDuration');
    });
    test('Get state object returns copy', () => {
        const copy = getStateObject();
        const orig = getState('timerDuration');
        copy.timerDuration = 9999;
        return getState('timerDuration') === orig;
    });
    
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
})();
```

## Troubleshooting

### Error: "Failed to fetch dynamically imported module"

**Cause:** The import path is wrong or the server isn't running from the project root.

**Solution:**
1. Make sure your server is running from the project root directory
2. Use absolute paths starting with `/` (e.g., `/src/client/state/app-state.js`)
3. Check the Network tab in DevTools to see what URL is being requested

### Error: "404 File not found"

**Cause:** The file path doesn't match the server's file structure.

**Solution:**
1. Verify the file exists at `src/client/state/app-state.js`
2. Check that your server is serving files from the project root
3. Try accessing the file directly in the browser: `http://localhost:8000/src/client/state/app-state.js`

### Error: "CORS policy"

**Cause:** Opening files directly from `file://` protocol.

**Solution:**
- Always use a local web server (not `file://`)
- Run: `python -m http.server 8000` or `npx http-server -p 8000`

## Server Setup

Make sure your server is running from the **project root**:

```bash
# From project root: C:\Users\tpost\Projects\Better Life
python -m http.server 8000
```

Then access:
- Main app: `http://localhost:8000/index.html`
- Test page: `http://localhost:8000/tests/state-manager-test.html`

