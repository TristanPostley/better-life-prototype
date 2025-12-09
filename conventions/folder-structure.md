# Folder Structure Conventions

This document describes the standard folder structure and file organization patterns used in the Better Life project.

## Root Structure

```
Better Life/
├── src/                    # Source code
│   ├── client/            # Client-side code (browser)
│   ├── server/            # Server-side code (minimal)
│   └── shared/            # Shared code (types, constants, utilities)
├── tests/                 # Test files
├── conventions/           # Project conventions documentation
├── index.html            # Main HTML entry point
├── styles.css            # Global styles
└── package.json          # Node.js dependencies
```

## Client Code (`src/client/`)

Client code runs in the browser and uses browser APIs (DOM, localStorage, etc.).

### Structure

```
src/client/
├── app.js                 # Main application entry point
├── domains/               # Domain modules (feature-based organization)
│   ├── auth/
│   │   ├── auth-ui.js    # Auth UI handlers
│   │   └── index.js      # Public API exports
│   ├── sessions/
│   │   ├── timer.js
│   │   ├── streak.js
│   │   ├── timer-service.js
│   │   ├── index.js
│   │   └── utils/        # Domain-specific utilities
│   │       ├── progress-ring.js
│   │       └── time-format.js
│   ├── navigation/
│   ├── reflection/
│   ├── users/
│   │   └── preferences/  # Nested domain features
│   └── feedback/
├── services/              # External service clients
│   └── supabase-client.js
├── state/                 # State management
│   ├── app-state.js      # State exports (backward compatibility)
│   └── state-manager.js  # State manager implementation
└── utils/                 # Client-specific utilities
    ├── dom-elements.js    # DOM element caching
    ├── dom-helpers.js    # DOM manipulation helpers
    ├── button-handlers.js
    └── module-registry.js # Module dependency registry
```

### Conventions

- **Domain modules** are organized by feature/domain (auth, sessions, navigation, etc.)
- Each domain has an `index.js` that exports the public API
- Domain-specific utilities go in a `utils/` subdirectory within the domain
- Client-only utilities go in `src/client/utils/`
- State management is centralized in `src/client/state/`

## Shared Code (`src/shared/`)

Shared code contains types, constants, and utilities that could theoretically be used by both client and server (though currently only client uses them).

### Structure

```
src/shared/
├── types/                 # Type definitions (JSDoc)
│   ├── api.js            # API response types
│   ├── dom.js            # DOM element types
│   └── state.js          # State types
├── domains/               # Domain-specific types
│   ├── auth/
│   │   └── types.js
│   ├── users/
│   │   └── types.js
│   ├── sessions/
│   │   └── types.js
│   ├── reflection/
│   │   └── types.js
│   └── feedback/
│       └── types.js
├── utils/                 # Shared utilities
│   ├── error-handler.js  # Error handling utilities
│   ├── transitions.js
│   └── index.js          # Utility exports
├── state/                 # Shared state structure (types only)
│   └── app-state.js      # State type definitions
└── constants.js          # Application-wide constants
```

### Conventions

- **Types** are defined using JSDoc `@typedef` comments
- Types are organized by domain in `src/shared/domains/`
- Global types (API, DOM, State) go in `src/shared/types/`
- Constants are centralized in `src/shared/constants.js`
- Shared utilities are pure functions with no side effects

## Server Code (`src/server/`)

Currently minimal - only contains database schema.

### Structure

```
src/server/
└── database/
    └── schema.sql        # PostgreSQL/Supabase schema
```

## Test Files (`tests/`)

### Structure

```
tests/
├── README.md             # Test documentation
├── run-tests.js          # Test runner
├── test-helpers.js       # Test utilities
├── api-response-guards.test.js
├── utils-guards.test.js
├── guardrails.test.js
├── state-manager.test.js
└── *.test.js            # Other test files
```

### Conventions

- Test files use `.test.js` suffix
- Test helpers are in `test-helpers.js`
- Main test runner is `run-tests.js`
- Tests are "guardrail" style - focused on invariants, not comprehensive coverage

## File Naming Conventions

### JavaScript Files

- **kebab-case** for all file names: `auth-ui.js`, `timer-service.js`
- **Descriptive names** that indicate purpose: `dom-elements.js`, `state-manager.js`
- **Suffixes** for clarity:
  - `-ui.js` for UI handlers
  - `-service.js` for service layer code
  - `.test.js` for test files

### Domain Index Files

- Each domain has an `index.js` that exports the public API
- Pattern: `src/client/domains/{domain}/index.js`
- Re-exports from domain implementation files

## Directory Organization Principles

1. **Domain-Driven** - Code is organized by business domain/feature
2. **Separation of Concerns** - Client, server, and shared code are clearly separated
3. **Public API Pattern** - Each domain exposes a clean public API via `index.js`
4. **Co-location** - Related code is kept together (e.g., domain utils in domain folders)

## Inconsistencies and Notes

### Current Inconsistencies

1. **Type File Locations** - Some types are in `src/shared/domains/`, some in `src/shared/types/`. The pattern is:
   - Domain-specific types: `src/shared/domains/{domain}/types.js`
   - Global types: `src/shared/types/{category}.js`

2. **State Location** - `src/client/state/app-state.js` contains runtime state (client-only), but types are in `src/shared/types/state.js`. This is intentional - types are shared, implementation is client-only.

3. **Utils Organization** - Some utilities are in `src/client/utils/`, some in `src/shared/utils/`. The distinction:
   - Client utils: Use browser APIs (DOM, localStorage)
   - Shared utils: Pure functions, no browser dependencies

### Migration Notes

- The project is transitioning from a flat structure to a domain-driven structure
- Some legacy code may still exist in non-standard locations
- New code should follow these conventions strictly

