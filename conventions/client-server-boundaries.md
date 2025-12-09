# Client-Server Boundaries

This document describes the separation between client-side and server-side code in the Better Life project.

## Project Architecture

The Better Life project is a **client-side JavaScript application** that runs entirely in the browser. It uses Supabase as a Backend-as-a-Service (BaaS) for authentication and data storage.

### Key Characteristics

- **No Node.js server** - All application logic runs in the browser
- **Supabase BaaS** - Backend services provided by Supabase
- **Client-only code** - All JavaScript executes in the browser
- **Database schema** - Only server-side artifact is the SQL schema file

## Directory Structure

### Client Code (`src/client/`)

All code that runs in the browser:

```
src/client/
├── app.js                 # Main entry point
├── domains/               # Domain modules (all client-side)
├── services/              # External service clients (Supabase)
├── state/                 # State management (browser runtime state)
└── utils/                 # Client utilities (DOM, localStorage)
```

**Characteristics:**
- Uses browser APIs: `document`, `window`, `localStorage`, `DOM`
- Makes HTTP requests to Supabase
- Handles user interactions and UI updates
- Manages browser-based state

### Server Code (`src/server/`)

Minimal server-side code:

```
src/server/
└── database/
    └── schema.sql         # PostgreSQL/Supabase database schema
```

**Characteristics:**
- Only contains database schema definitions
- SQL file executed on Supabase server
- No runtime server code

### Shared Code (`src/shared/`)

Code that could theoretically be used by both client and server:

```
src/shared/
├── types/                 # Type definitions (JSDoc)
├── domains/               # Domain-specific types
├── utils/                 # Shared utilities (pure functions)
└── constants.js          # Application constants
```

**Characteristics:**
- Pure type definitions (no runtime code)
- Pure utility functions (no side effects)
- Constants and configuration
- Currently only used by client, but structured for potential server use

## Code Classification

### Client-Only Indicators

Code that uses these APIs is client-only:
- `document.*` - DOM manipulation
- `window.*` - Browser APIs
- `localStorage.*` - Browser storage
- `HTMLElement`, `Event`, etc. - DOM types
- Browser timers: `setInterval`, `setTimeout`

### Server-Only Indicators

Currently, only:
- SQL files (`.sql`)
- Database schema definitions

### Shared Code Indicators

Code that is:
- Pure functions (no side effects)
- Type definitions (JSDoc)
- Constants and configuration
- No browser or server APIs

## API Boundaries

### Supabase Client

The Supabase client (`src/client/services/supabase-client.js`) is client-side code that:
- Runs in the browser
- Makes HTTP requests to Supabase
- Handles authentication state
- Manages API calls

**Pattern:**
```javascript
// Client-side code making API calls
export async function signUpWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    // Handle response
}
```

### API Response Pattern

All API functions return a standardized response:

```javascript
// Success
{ success: true, data: {...}, message?: string }

// Error
{ success: false, error: string }
```

This pattern allows client code to handle responses consistently.

## State Management

### Client State

State managed in `src/client/state/`:
- Browser runtime state (timers, UI state)
- Persisted to `localStorage`
- Not shared with server

### Server State

No server-side state management exists. All state is:
- Client-side (browser)
- Persisted to Supabase (via API calls)
- Or stored in `localStorage`

## Data Flow

### Client to Server

1. User action in browser
2. Client code calls Supabase API
3. Supabase handles request (authentication, database)
4. Response returned to client
5. Client updates UI/state

### Server to Client

1. Supabase provides real-time subscriptions (if used)
2. Client listens for auth state changes
3. Client updates UI based on server events

## Authentication Flow

### Client-Side Auth

Authentication is handled client-side:
- Supabase client runs in browser
- Auth state managed in browser
- Session stored by Supabase (cookies/localStorage)
- Auth state changes trigger browser events

**Pattern:**
```javascript
// Client-side auth initialization
export async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    // Update client state
    supabase.auth.onAuthStateChange((event, session) => {
        // Handle auth state changes
    });
}
```

## File Placement Rules

### When to Place Code in `src/client/`

- Uses browser APIs (DOM, localStorage, window)
- Handles user interactions
- Manages UI state
- Makes API calls to external services

### When to Place Code in `src/shared/`

- Pure functions (no side effects)
- Type definitions
- Constants and configuration
- Code that could be used by both client and server (theoretical)

### When to Place Code in `src/server/`

- Database schema files
- Server configuration (if added in future)
- Server-side business logic (if added in future)

## Import Boundaries

### Client Code Imports

Client code can import:
- Other client code
- Shared code (types, constants, utilities)
- External libraries (Supabase, etc.)

Client code should NOT import:
- Server code (currently none exists)

### Shared Code Imports

Shared code should NOT import:
- Client-specific code
- Server-specific code
- Browser APIs
- Node.js APIs

Shared code can import:
- Other shared code
- External libraries (only if pure/universal)

## Testing Boundaries

### Client Tests

Tests for client code run in:
- Browser environment (for DOM tests)
- Node.js environment (for unit tests with mocks)

### Server Tests

Currently no server tests exist (no server code).

## Inconsistencies and Notes

### Current State

1. **Pure Client Application** - No server-side application code exists
2. **Supabase as BaaS** - All backend functionality provided by Supabase
3. **Shared Code Structure** - Types and utilities structured as if server might exist, but currently only used by client

### Migration Considerations

If a Node.js server is added in the future:
- Move business logic to server
- Keep UI logic in client
- Share types and utilities via `src/shared/`
- API layer would be server-side, client would call it

### Best Practices

1. **Clear Separation** - Keep client and server code clearly separated
2. **Shared Types** - Use `src/shared/` for types that both sides need
3. **API Boundaries** - Define clear API contracts between client and server
4. **No Direct Database Access** - Client should never access database directly, only via API

