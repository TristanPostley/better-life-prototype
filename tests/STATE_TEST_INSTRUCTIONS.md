# State Manager Test Instructions

## Problem: CORS Error

When opening `state-manager-test.html` directly from the file system, you'll get a CORS error because browsers block ES6 module imports from `file://` protocol.

## Solution Options

### Option 1: Use a Local Web Server (Recommended)

1. **Open a terminal** in the project root directory (`C:\Users\tpost\Projects\Better Life`)

2. **Start a local server** using one of these methods:

   **Python (if installed):**
   ```bash
   python -m http.server 8000
   ```

   **Node.js (if you have npx):**
   ```bash
   npx http-server -p 8000
   ```

   **PHP (if installed):**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000/tests/state-manager-test.html
   ```

### Option 2: Run Tests from Main Application (Easiest)

Since the state manager is already loaded in the main application, you can test it directly:

1. **Open the main application:**
   - Open `index.html` in your browser (via a server if needed)
   - Or use the VS Code Live Server extension

2. **Open browser console** (F12)

3. **Run the test commands:**

```javascript
// Import state manager functions
const { getState, setState, setTimerDuration, setCurrentTimer, resetTimerState, subscribe, getStateObject } = await import('./src/client/state/app-state.js');

// Test 1: Check initial state
console.log('Timer Duration:', getState('timerDuration'));
console.log('Current Timer:', getState('currentTimer'));
console.log('Dark Mode:', getState('darkMode'));

// Test 2: Set non-persisted state
setState('isTimerRunning', true, { persist: false });
console.log('✓ isTimerRunning:', getState('isTimerRunning'));

// Test 3: Set persisted state
setState('darkMode', true);
console.log('✓ darkMode:', getState('darkMode'));
console.log('✓ localStorage:', localStorage.getItem('bl_darkMode'));

// Test 4: Timer duration sync
setTimerDuration(900);
console.log('✓ timerDuration:', getState('timerDuration'));
console.log('✓ currentTimer synced:', getState('currentTimer'));

// Test 5: State observer
let observerCalled = false;
const unsubscribe = subscribe('darkMode', (newVal, oldVal) => {
    console.log('✓ Observer called!', oldVal, '->', newVal);
    observerCalled = true;
});
setState('darkMode', false);
console.log('✓ Observer test:', observerCalled ? 'PASSED' : 'FAILED');
unsubscribe();

// Test 6: Reset timer
setCurrentTimer(100);
resetTimerState();
console.log('✓ Timer reset. currentTimer:', getState('currentTimer'));

// Test 7: Get state object
const stateCopy = getStateObject();
console.log('✓ State object:', Object.keys(stateCopy).length, 'properties');

// Restore original values
setState('darkMode', false);
setTimerDuration(600);
```

### Option 3: Use VS Code Live Server Extension

1. **Install Live Server extension** in VS Code
2. **Right-click on `index.html`** → "Open with Live Server"
3. **Navigate to** `http://localhost:5500/tests/state-manager-test.html`

## Quick Test Checklist

After running tests, verify:

- [ ] State initializes with correct defaults
- [ ] `getState()` returns correct values
- [ ] `setState()` updates state correctly
- [ ] Persisted state saves to localStorage
- [ ] Non-persisted state doesn't save to localStorage
- [ ] `setTimerDuration()` syncs currentTimer
- [ ] `resetTimerState()` resets timer correctly
- [ ] State observers are called on changes
- [ ] `getStateObject()` returns a copy

## Expected Results

All tests should pass, showing:
- ✓ State initialized
- ✓ Default values correct
- ✓ State setters work
- ✓ State persistence works
- ✓ State observers work
- ✓ State validation works

## Troubleshooting

**If you see CORS errors:**
- Make sure you're using a web server, not opening files directly
- Check that the server is running in the project root directory
- Verify the URL path is correct

**If imports fail:**
- Check that you're in the browser console of the running application
- Make sure the application has fully loaded
- Verify the module paths are correct relative to your server root

