# Contributing to Better Life

Welcome! This guide explains how the codebase is organized and how to add new features without breaking existing conventions.

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Where Logic Belongs](#where-logic-belongs)
3. [Domain Boundaries](#domain-boundaries)
4. [Naming Rules](#naming-rules)
5. [Adding New Modules](#adding-new-modules)

---

## Repository Structure

The codebase is organized into three main directories:

```
src/
├── client/          # Browser-side code (runs in the browser)
├── shared/          # Code shared between client and server (types, constants)
└── server/          # Server-side code (database schemas, API handlers)
```

### `src/client/` - Browser Code

All code that runs in the browser lives here:

- **`app.js`** - Main entry point, initializes all modules
- **`domains/`** - Feature modules organized by domain (auth, sessions, users, etc.)
- **`services/`** - External service integrations (Supabase, APIs)
- **`utils/`** - Shared utility functions (DOM helpers, formatters)
- **`state/`** - Global application state

### `src/shared/` - Shared Code

Code that could be used by both client and server:

- **`types/`** - Type definitions (JSDoc types for API responses, DOM elements, state)
- **`domains/`** - Domain-specific type definitions

### `src/server/` - Server Code

Server-side resources:

- **`database/`** - Database schemas and migrations

---

## Where Logic Belongs

### Domains (`src/client/domains/`)

**What goes here:** Feature-specific logic organized by business domain.

Each domain is a folder containing:
- **`index.js`** - Public API (exports only what other modules should use)
- Feature files (e.g., `timer.js`, `auth-ui.js`)
- **`utils/`** subfolder (domain-specific utilities)

**Current domains:**
- **`auth/`** - Authentication (sign up, sign in, password reset)
- **`sessions/`** - Timer and focus sessions
- **`users/`** - User data, preferences, settings
- **`navigation/`** - Page routing, modals, menu interactions
- **`reflection/`** - Questions and journaling
- **`feedback/`** - User feedback submission

**Example:**
```javascript
// src/client/domains/sessions/timer.js
export function initTimer() { /* ... */ }
export function handleStartTimerClick() { /* ... */ }

// src/client/domains/sessions/index.js (Public API)
export { initTimer, handleStartTimerClick } from './timer.js';
// Don't export internal functions like startTimer(), pauseTimer()
```

### Services (`src/client/services/`)

**What goes here:** External service integrations (APIs, third-party libraries).

**Example:** `supabase-client.js` - All Supabase API calls

**Rules:**
- One service per file
- Return standardized `{ success: boolean, data?: T, error?: string }` responses
- Handle all service-specific error handling here

### Utils (`src/client/utils/`)

**What goes here:** Pure utility functions used across multiple domains.

**Example:** `dom-elements.js` - Centralized DOM element caching

**Rules:**
- No business logic
- No side effects (except DOM caching)
- Reusable across domains

### State (`src/client/state/`)

**What goes here:** Global application state that multiple domains need.

**Example:** `app-state.js` - Timer state, drag state, menu state

**Rules:**
- Only truly global state (not domain-specific)
- Mutable state object (this is intentional for simplicity)

---

## Domain Boundaries

### The Golden Rule

**Domains should not directly import from other domains.**

Instead, they communicate through:
1. **Shared state** (`src/client/state/app-state.js`)
2. **Services** (`src/client/services/`)
3. **Global events** (`window.dispatchEvent`, `window.addEventListener`)
4. **Navigation domain** (for page changes)

### ✅ Good: Cross-Domain Communication

```javascript
// Domain A needs to show a page
import { showPage } from '../navigation/index.js';
showPage('menu');

// Domain A needs to open a modal
import { openModal } from '../navigation/index.js';
openModal('<h2>Hello</h2>');

// Domain A needs to check auth state
import { currentUser } from '../../services/supabase-client.js';
if (currentUser) { /* ... */ }
```

### ❌ Bad: Direct Domain Imports

```javascript
// DON'T do this:
import { someFunction } from '../sessions/timer.js';  // Direct domain import
```

### Domain Responsibilities

Each domain owns its own:
- **UI logic** - How its features are displayed
- **Event handlers** - User interactions within the domain
- **Data transformations** - Converting data for display

Domains delegate to:
- **Services** - API calls, external integrations
- **Navigation** - Page changes, modals
- **State** - Reading/writing global state

---

## Naming Rules

### Files

- **Use kebab-case:** `auth-ui.js`, `data-migration.js`, `time-format.js`
- **Be descriptive:** `settings-ui.js` not `settings.js`
- **Suffix UI files:** `*-ui.js` for files that render UI

### Functions

- **camelCase** for all functions: `initTimer()`, `handleStartTimerClick()`
- **`init*`** prefix for initialization functions: `initTimer()`, `initNavigation()`
- **`handle*`** prefix for event handlers: `handleStartTimerClick()`, `handleSignUp()`
- **`show*`** prefix for display functions: `showPage()`, `showAuthForm()`
- **`get*`** prefix for getters: `getDOMElements()`, `getCurrentTimer()`
- **`set*`** prefix for setters: `setTimerDisplay()`
- **`update*`** prefix for updates: `updateStreak()`, `updateProgressRing()`

### Variables

- **camelCase** for variables: `currentUser`, `timerDuration`
- **UPPER_SNAKE_CASE** for constants: `BUTTON_SIZE`, `SUPABASE_URL`

### Exports

- **Only export public API** from `index.js` files
- **Don't export internal functions** (used only within the domain)
- **Use named exports** (not default exports)

**Example:**
```javascript
// timer.js - Internal function (not exported)
function startTimer() { /* ... */ }

// timer.js - Public function (exported)
export function initTimer() { /* ... */ }

// index.js - Only exports public API
export { initTimer } from './timer.js';
// Don't export startTimer() - it's internal
```

---

## Adding New Modules

### Step 1: Choose the Right Location

**New feature?** → Create a new domain in `src/client/domains/`

**New utility?** → Add to `src/client/utils/` if used across domains, or domain's `utils/` if domain-specific

**New service?** → Add to `src/client/services/`

**New type?** → Add to `src/shared/types/` (global) or `src/shared/domains/{domain}/types.js` (domain-specific)

### Step 2: Create the Domain Structure

```
src/client/domains/your-domain/
├── index.js          # Public API (exports only)
├── your-feature.js   # Main feature file
└── utils/            # Optional: domain-specific utilities
    └── helper.js
```

### Step 3: Write the Public API (`index.js`)

```javascript
/**
 * Your Domain - Public API
 */

export { initYourFeature, handleYourAction } from './your-feature.js';
```

**Rule:** Only export functions that other domains need to use.

### Step 4: Implement the Feature

```javascript
// your-feature.js
import { getDOMElements } from '../../utils/dom-elements.js';
import { state } from '../../state/app-state.js';
import * as supabaseModule from '../../services/supabase-client.js';

let dom = null;

/**
 * Initialize your feature
 * @returns {void}
 */
export function initYourFeature() {
    dom = getDOMElements();
    // Setup code here
}

/**
 * Handle user action
 * @returns {void}
 */
export function handleYourAction() {
    // Implementation here
}
```

### Step 5: Add Types (if needed)

If your domain has data structures, add types:

```javascript
// src/shared/domains/your-domain/types.js
/**
 * Your Domain Types
 */

/**
 * @typedef {Object} YourDataType
 * @property {string} id
 * @property {string} name
 */
```

### Step 6: Integrate in `app.js`

```javascript
// src/client/app.js
import { initYourFeature } from './domains/your-domain/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ... existing code ...
    
    try {
        initYourFeature();
    } catch (error) {
        console.error('Error initializing your feature:', error);
    }
});
```

### Step 7: Follow Error Handling Patterns

All API calls should return standardized responses:

```javascript
// In your service or domain
export async function yourApiCall() {
    try {
        const result = await someApi();
        return { success: true, data: result };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

// Usage
const result = await yourApiCall();
if (result.success) {
    // Use result.data
} else {
    // Handle result.error
}
```

---

## Quick Reference Checklist

When adding a new feature:

- [ ] Created domain folder in `src/client/domains/`
- [ ] Created `index.js` with public API exports only
- [ ] Used descriptive, kebab-case file names
- [ ] Used `init*`, `handle*`, `show*` prefixes appropriately
- [ ] Added types to `src/shared/domains/{domain}/types.js` if needed
- [ ] Integrated initialization in `app.js`
- [ ] Followed error handling patterns (`{ success, data, error }`)
- [ ] No direct domain-to-domain imports
- [ ] Only exported public API from `index.js`

---

## Examples

### Example 1: Adding a New Domain

**Goal:** Add a "Notes" feature where users can save notes.

1. **Create domain structure:**
   ```
   src/client/domains/notes/
   ├── index.js
   └── notes-ui.js
   ```

2. **Create types:**
   ```javascript
   // src/shared/domains/notes/types.js
   /**
    * @typedef {Object} Note
    * @property {string} id
    * @property {string} text
    * @property {string} created_at
    */
   ```

3. **Implement feature:**
   ```javascript
   // notes-ui.js
   export function initNotes() { /* ... */ }
   export function handleSaveNote() { /* ... */ }
   ```

4. **Export public API:**
   ```javascript
   // index.js
   export { initNotes, handleSaveNote } from './notes-ui.js';
   ```

5. **Integrate in app.js:**
   ```javascript
   import { initNotes } from './domains/notes/index.js';
   initNotes();
   ```

### Example 2: Adding a Utility Function

**Goal:** Add a date formatting utility used across domains.

1. **Add to shared utils:**
   ```javascript
   // src/client/utils/date-format.js
   export function formatDate(date) {
       return new Date(date).toLocaleDateString();
   }
   ```

2. **Use in domains:**
   ```javascript
   import { formatDate } from '../../utils/date-format.js';
   ```

---

## Questions?

If you're unsure where something belongs:

1. **Is it used by multiple domains?** → `src/client/utils/` or `src/shared/`
2. **Is it a complete feature?** → New domain in `src/client/domains/`
3. **Is it an external service?** → `src/client/services/`
4. **Is it global state?** → `src/client/state/`
5. **Is it a type definition?** → `src/shared/types/` or `src/shared/domains/{domain}/types.js`

When in doubt, ask! It's better to discuss structure than to break conventions.

---

## Summary

- **Structure:** `client/` (browser), `shared/` (types), `server/` (database)
- **Domains:** Feature modules in `domains/`, each with an `index.js` public API
- **Boundaries:** Domains don't import from each other; use services, state, or navigation
- **Naming:** kebab-case files, camelCase functions, descriptive prefixes
- **Adding modules:** Create domain → Write public API → Add types → Integrate in app.js

Happy contributing! 🎉

