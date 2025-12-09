# Architecture Overview

This document describes the architectural structure, modules, invariants, dependencies, and folder organization of the Better Life application.

## Modules

### Domain Modules

The application follows a domain-driven design pattern with the following core domains:

#### 1. **Sessions Domain** (`src/client/domains/sessions/`)
Manages timer functionality and session tracking.

**Exports:**
- `initTimer()` - Initialize timer functionality
- `handleStartTimerClick()` - Handle timer start/pause button
- `handleCircleClick()` - Handle timer circle click interactions
- `setTimerDisplay()` - Update timer display
- `resetTimerDisplay()` - Reset timer to initial state
- `updateStreak()` - Update user streak after session completion
- `startTimerCountdown()`, `stopTimerCountdown()` - Timer countdown control
- `getTimerDuration()` - Get current timer duration

**Internal Modules:**
- `timer.js` - Main timer logic and initialization
- `timer-service.js` - Timer countdown service
- `streak.js` - Streak calculation and management
- `utils/progress-ring.js` - Circular progress indicator
- `utils/time-format.js` - Time formatting utilities

#### 2. **Navigation Domain** (`src/client/domains/navigation/`)
Handles page routing and modal management.

**Exports:**
- `initNavigation()` - Initialize navigation system
- `showPage(pageId)` - Navigate to a specific page
- `initModal()` - Initialize modal system
- `openModal(content, hideCloseButton)` - Open a modal with content
- `closeModal()` - Close the active modal
- `initMenuInteractions()` - Initialize menu button interactions

**Internal Modules:**
- `routing.js` - Page routing logic
- `modal.js` - Modal overlay management
- `menu-interactions.js` - Menu-specific interactions

#### 3. **Reflection Domain** (`src/client/domains/reflection/`)
Manages reflection questions and journal entries.

**Exports:**
- `initQuestions()` - Initialize questions system

**Internal Modules:**
- `questions-ui.js` - Questions UI and interaction logic

#### 4. **Users Domain** (`src/client/domains/users/`)
Handles user data, preferences, and persistence.

**Exports:**
- `initSettings()` - Initialize settings UI
- `loadUserData()` - Load user data from storage
- `checkAndMigrateLocalStorage()` - Migrate old localStorage data
- `applyFont()` - Apply user font preference

**Internal Modules:**
- `data-migration.js` - Data migration logic
- `data-persistence.js` - Data persistence layer
- `preferences/fonts.js` - Font preference management
- `preferences/settings-ui.js` - Settings UI rendering

#### 5. **Auth Domain** (`src/client/domains/auth/`)
Handles authentication UI and flows.

**Exports:**
- (Public API through index.js)

**Internal Modules:**
- `auth-ui.js` - Authentication UI components

#### 6. **Feedback Domain** (`src/client/domains/feedback/`)
Handles user feedback submission (currently integrated in app.js).

### Service Modules

#### **Supabase Client** (`src/client/services/supabase-client.js`)
Provides Supabase client initialization and API methods for authentication, data persistence, and feedback submission.

### State Management

#### **State Manager** (`src/client/state/state-manager.js`)
Centralized state management with:
- Single source of truth for application state
- Automatic localStorage persistence
- State change observers
- State validation

**State Structure:**
- Timer state (duration, current time, running status)
- Menu state (title timeout, dismissal status)
- Drag state (dragged buttons, offsets)
- UI state (triangle rotation, modal state)
- User preferences (dark mode, font family, last session date)

#### **App State** (`src/client/state/app-state.js`)
Public interface for state management, re-exports state manager functions.

### Utility Modules

#### **DOM Elements** (`src/client/utils/dom-elements.js`)
Centralized DOM element caching and access. All DOM access must go through this module.

#### **DOM Helpers** (`src/client/utils/dom-helpers.js`)
DOM manipulation utility functions.

#### **Module Registry** (`src/client/utils/module-registry.js`)
Dependency injection system for cross-module communication. Replaces global window.* patterns.

#### **Button Handlers** (`src/client/utils/button-handlers.js`)
Initial button handlers for landing page (early initialization).

### Shared Modules

#### **Constants** (`src/shared/constants.js`)
Application-wide constants:
- Timer configuration
- CSS class names
- LocalStorage keys
- Page identifiers
- Animation timing

#### **Error Handler** (`src/shared/utils/error-handler.js`)
Standardized error handling utilities:
- Error severity levels (CRITICAL, ERROR, WARNING, INFO)
- `handleError()` - Centralized error logging
- `withErrorHandling()` - Wrap sync functions
- `withAsyncErrorHandling()` - Wrap async functions

#### **Type Definitions** (`src/shared/types/`)
Shared TypeScript/JSDoc type definitions:
- `state.js` - State type definitions
- `api.js` - API type definitions
- `dom.js` - DOM type definitions

#### **Domain Types** (`src/shared/domains/*/types.js`)
Domain-specific type definitions shared between client and server.

## Invariants

### 1. **DOM Access Invariant**
- **ALL** DOM element access MUST go through `getDOMElements()` in `src/client/utils/dom-elements.js`
- Direct `document.getElementById()` or `querySelector()` calls are forbidden (except within `getDOMElements()` itself)
- All elements returned from `getDOMElements()` may be `null` and must be null-checked before use
- This ensures null safety, consistent error handling, and testability

### 2. **State Management Invariant**
- Application state MUST be accessed through the state manager (`getState()`, `setState()`)
- Direct mutation of state objects is forbidden
- State changes MUST go through `setState()` to trigger observers and persistence
- State is persisted to localStorage automatically

### 3. **Module Dependency Invariant**
- Cross-module dependencies MUST use either:
  - Direct ES6 imports (preferred)
  - Module Registry (`moduleRegistry`) for dynamic/circular dependencies
- Global `window.*` pollution is forbidden except for backward compatibility
- Modules MUST export a public API through `index.js` files

### 4. **Error Handling Invariant**
- All errors MUST be handled using `handleError()` from `src/shared/utils/error-handler.js`
- Async functions MUST use `withAsyncErrorHandling()` wrapper
- Error context MUST include module and function names
- Critical errors MUST be logged; warnings may be suppressed based on severity

### 5. **Domain Boundary Invariant**
- Domains MUST be self-contained with minimal dependencies on other domains
- Domains communicate through:
  - Shared state (state manager)
  - Module registry (for callbacks)
  - Direct imports (only when necessary)
- Domain-specific logic MUST stay within domain folders

### 6. **Client-Server Boundary Invariant**
- Client code (`src/client/`) MUST NOT import server code (`src/server/`)
- Server code MUST NOT import client code
- Shared code goes in `src/shared/`
- Server-only logic (database, API routes) stays in `src/server/`

### 7. **File Organization Invariant**
- Each domain MUST have an `index.js` that exports the public API
- Internal implementation files stay within domain folders
- Domain-specific types MUST be in `src/shared/domains/{domain}/types.js`
- Utility files shared within a domain go in `utils/` subdirectories

### 8. **Initialization Invariant**
- All modules MUST have initialization functions (e.g., `initTimer()`, `initNavigation()`)
- Initialization functions MUST be idempotent (safe to call multiple times)
- Initialization MUST happen in `src/client/app.js` during `DOMContentLoaded`

## Allowed Dependencies

### Dependency Rules

#### 1. **Client Domain Modules** (`src/client/domains/*`)
**Can import:**
- `src/shared/**` - All shared modules (constants, types, utilities)
- `src/client/state/**` - State management
- `src/client/utils/**` - Client utilities
- `src/client/services/**` - Service modules (Supabase)
- Other domains (minimal, prefer state/registry communication)

**Cannot import:**
- `src/server/**` - Server code
- `src/core/**` - Reserved for future use

#### 2. **Client Services** (`src/client/services/*`)
**Can import:**
- `src/shared/**` - Shared modules
- External dependencies (e.g., `@supabase/supabase-js`)

**Cannot import:**
- `src/client/domains/**` - Should not depend on domains
- `src/client/state/**` - Services should be stateless
- `src/server/**` - Server code

#### 3. **Client State** (`src/client/state/*`)
**Can import:**
- `src/shared/**` - Shared modules (constants, types, error handler)

**Cannot import:**
- `src/client/domains/**` - State manager should not know about domains
- `src/client/services/**` - State should not depend on services
- `src/server/**` - Server code

#### 4. **Client Utils** (`src/client/utils/*`)
**Can import:**
- `src/shared/**` - Shared modules

**Cannot import:**
- `src/client/domains/**` - Utils should be domain-agnostic
- `src/client/services/**` - Utils should not depend on services
- `src/server/**` - Server code

#### 5. **Shared Modules** (`src/shared/**`)
**Can import:**
- Other shared modules only
- Standard JavaScript/TypeScript libraries

**Cannot import:**
- `src/client/**` - Shared code must be client/server agnostic
- `src/server/**` - Shared code must be client/server agnostic

#### 6. **Server Code** (`src/server/**`)
**Can import:**
- `src/shared/**` - Shared modules
- Database libraries, server frameworks

**Cannot import:**
- `src/client/**` - Server should not depend on client

#### 7. **Main App** (`src/client/app.js`)
**Can import:**
- All client modules (domains, services, state, utils)
- `src/shared/**` - Shared modules

**Cannot import:**
- `src/server/**` - Server code

### Dependency Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     src/client/app.js                    │
│                   (Application Entry)                    │
└───────────────┬─────────────────────────────────────────┘
                │
    ┌───────────┴───────────┬──────────────┬──────────────┐
    │                       │              │              │
┌───▼────────┐  ┌───────────▼──┐  ┌────────▼──────┐  ┌───▼──────────┐
│  Domains   │  │   Services   │  │     State     │  │    Utils     │
│  (Sessions │  │  (Supabase)  │  │   (Manager)   │  │   (DOM, etc) │
│  Navigation│  │              │  │               │  │              │
│  Users, etc│  │              │  │               │  │              │
└───┬────────┘  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘
    │                  │                  │                  │
    └──────────────────┴──────────────────┴──────────────────┘
                       │
              ┌────────▼─────────┐
              │   src/shared/    │
              │ (Constants, Types│
              │  Error Handler)  │
              └──────────────────┘
                       │
              ┌────────▼─────────┐
              │  External Deps   │
              │ (@supabase/...)  │
              └──────────────────┘
```

## Folder Purposes

### Root Level

- **`index.html`** - Main HTML entry point
- **`styles.css`** - Global stylesheet
- **`package.json`** - NPM dependencies and scripts
- **`blueprint.md`** - Application blueprint (pages, flows)
- **`ARCHITECTURE.md`** - This document

### `src/` - Source Code Root

Main source code directory containing all application code.

#### `src/client/` - Client-Side Code

All code that runs in the browser.

##### `src/client/app.js`
Main application entry point. Initializes all modules on `DOMContentLoaded`.

##### `src/client/domains/` - Domain Modules
Domain-driven design modules, each representing a business domain:

- **`auth/`** - Authentication domain
  - `auth-ui.js` - Auth UI components
  - `index.js` - Public API exports

- **`sessions/`** - Timer and session management domain
  - `timer.js` - Timer logic
  - `timer-service.js` - Timer countdown service
  - `streak.js` - Streak calculation
  - `utils/` - Session-specific utilities

- **`navigation/`** - Navigation and routing domain
  - `routing.js` - Page routing
  - `modal.js` - Modal management
  - `menu-interactions.js` - Menu interactions

- **`reflection/`** - Reflection questions domain
  - `questions-ui.js` - Questions UI
  - `index.js` - Public API

- **`users/`** - User data and preferences domain
  - `data-migration.js` - Data migration
  - `data-persistence.js` - Data persistence
  - `preferences/` - User preferences (fonts, settings)

- **`feedback/`** - User feedback domain (future expansion)

##### `src/client/services/` - External Service Integrations
Service modules that integrate with external APIs:

- **`supabase-client.js`** - Supabase client initialization and API methods

##### `src/client/state/` - State Management
Centralized state management:

- **`state-manager.js`** - Core state management implementation
- **`app-state.js`** - Public state API

##### `src/client/utils/` - Client Utilities
Reusable client-side utilities:

- **`dom-elements.js`** - DOM element caching (single source of truth)
- **`dom-helpers.js`** - DOM manipulation helpers
- **`module-registry.js`** - Dependency injection registry
- **`button-handlers.js`** - Early button handlers (landing page)

#### `src/server/` - Server-Side Code

Code that runs on the server (currently minimal):

- **`database/schema.sql`** - Database schema definitions

#### `src/shared/` - Shared Code

Code shared between client and server (must be environment-agnostic):

- **`constants.js`** - Application constants
- **`domains/{domain}/types.js`** - Domain-specific type definitions
- **`types/`** - Shared type definitions (state, API, DOM)
- **`utils/`** - Shared utilities:
  - **`error-handler.js`** - Error handling utilities
  - **`transitions.js`** - Transition utilities
  - **`index.js`** - Shared utilities index

#### `src/core/` - Core Library Code

Reserved for future use - core library functionality that may be extracted.

### `tests/` - Test Files

Test files and test utilities:

- **`run-tests.js`** - Test runner
- **`test-helpers.js`** - Test utilities
- **`*.test.js`** - Test files

### `conventions/` - Development Conventions

Documentation of project conventions:

- **`folder-structure.md`** - Folder organization rules
- **`naming-conventions.md`** - Naming standards
- **`error-handling.md`** - Error handling patterns
- **`imports-and-dependencies.md`** - Import/dependency rules
- **`client-server-boundaries.md`** - Client/server separation
- **`testing-organization.md`** - Test organization
- **`DOMAIN_STRUCTURE_PROPOSAL.md`** - Domain structure documentation

### Documentation Files (Root)

Various documentation files tracking refactoring progress, issues, and analysis.

