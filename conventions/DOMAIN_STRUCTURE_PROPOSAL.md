# Domain Structure Proposal

This document describes the domain-driven design structure used in the Better Life project.

## Domain Organization

The project is organized by **business domains** rather than technical layers. Each domain represents a cohesive area of functionality.

## Current Domains

### 1. Auth Domain (`src/client/domains/auth/`)

**Purpose**: User authentication and authorization

**Structure**:
```
auth/
├── auth-ui.js      # UI handlers for auth forms
└── index.js        # Public API exports
```

**Shared Types**: `src/shared/domains/auth/types.js`

**Responsibilities**:
- Sign up, sign in, sign out
- Magic link authentication
- Password reset
- Auth state management
- Auth UI interactions

### 2. Sessions Domain (`src/client/domains/sessions/`)

**Purpose**: Timer sessions and session management

**Structure**:
```
sessions/
├── timer.js           # Timer logic and controls
├── timer-service.js   # Timer service layer
├── streak.js          # Streak calculation
├── index.js           # Public API exports
└── utils/             # Domain-specific utilities
    ├── progress-ring.js
    └── time-format.js
```

**Shared Types**: `src/shared/domains/sessions/types.js`

**Responsibilities**:
- Timer countdown logic
- Timer display updates
- Progress ring visualization
- Streak tracking
- Session completion

### 3. Navigation Domain (`src/client/domains/navigation/`)

**Purpose**: Page navigation and modal management

**Structure**:
```
navigation/
├── routing.js          # Page navigation
├── modal.js            # Modal management
├── menu-interactions.js # Menu UI interactions
└── index.js            # Public API exports
```

**Shared Types**: None (UI-only domain)

**Responsibilities**:
- Page transitions
- Modal open/close
- Menu interactions
- Navigation state

### 4. Reflection Domain (`src/client/domains/reflection/`)

**Purpose**: Reflection questions and responses

**Structure**:
```
reflection/
├── questions-ui.js    # Questions UI handlers
└── index.js           # Public API exports
```

**Shared Types**: `src/shared/domains/reflection/types.js`

**Responsibilities**:
- Question flows
- Response collection
- Reflection UI interactions

### 5. Users Domain (`src/client/domains/users/`)

**Purpose**: User data and preferences

**Structure**:
```
users/
├── data-persistence.js    # Data persistence (localStorage)
├── data-migration.js      # Data migration utilities
├── index.js               # Public API exports
└── preferences/           # User preferences subdomain
    ├── fonts.js           # Font management
    └── settings-ui.js     # Settings UI
```

**Shared Types**: `src/shared/domains/users/types.js`

**Responsibilities**:
- User data persistence
- User preferences (dark mode, fonts)
- Settings UI
- Data migration

### 6. Feedback Domain (`src/client/domains/feedback/`)

**Purpose**: User feedback collection

**Structure**:
```
feedback/
└── index.js           # Public API (placeholder)
```

**Shared Types**: `src/shared/domains/feedback/types.js`

**Responsibilities**:
- Feedback submission
- Feedback UI (currently in app.js)

## Domain Structure Pattern

### Standard Domain Structure

```
{domain}/
├── {domain}-ui.js     # UI handlers (if needed)
├── {domain}-service.js # Service layer (if needed)
├── index.js           # Public API exports
└── utils/             # Domain-specific utilities (optional)
    └── *.js
```

### Public API Pattern

Each domain exports a clean public API via `index.js`:

```javascript
/**
 * {Domain} Domain - Public API
 */

// Re-export public functions
export { function1, function2 } from './implementation.js';
export { function3 } from './other-file.js';
```

### Domain Types

Each domain has corresponding types in `src/shared/domains/{domain}/types.js`:

```javascript
/**
 * {Domain} Domain Types
 */

/**
 * @typedef {Object} DomainType
 * @property {string} property
 */
```

## Domain Principles

### 1. Cohesion

All code related to a domain is kept together:
- UI handlers
- Business logic
- Domain-specific utilities
- Domain types

### 2. Encapsulation

Domains expose only what's needed via public API:
- Other domains import from `index.js`
- Internal implementation is private
- Clear boundaries between domains

### 3. Independence

Domains should be as independent as possible:
- Minimal cross-domain dependencies
- Shared code in `src/shared/`
- Domain-specific code in domain folder

### 4. Single Responsibility

Each domain has a clear, single purpose:
- Auth: Authentication only
- Sessions: Timer sessions only
- Navigation: Navigation only
- etc.

## Cross-Domain Communication

### Direct Imports (Preferred)

Domains can import from other domains via their public API:

```javascript
// In navigation domain
import { showPage } from '../navigation/index.js';
```

### Module Registry (When Needed)

For dynamic dependencies or circular dependency workarounds:

```javascript
// Register
moduleRegistry.register('finishSession', finishSession);

// Access
const finishSession = moduleRegistry.get('finishSession');
```

### Shared Code

Common functionality goes in `src/shared/`:
- Types
- Constants
- Utilities
- State types

## Domain Boundaries

### What Belongs in a Domain

- **Domain-specific logic** - Business rules for that domain
- **Domain UI** - UI handlers specific to that domain
- **Domain types** - Types specific to that domain
- **Domain utilities** - Utilities used only by that domain

### What Belongs in Shared

- **Common types** - Types used by multiple domains
- **Common utilities** - Utilities used by multiple domains
- **Constants** - Application-wide constants
- **Error handling** - Shared error handling utilities

### What Belongs in Client Utils

- **DOM utilities** - General DOM manipulation
- **Module registry** - Cross-module dependency management
- **Client-specific utilities** - Browser-specific helpers

## Subdomains

Some domains have subdomains for nested features:

```
users/
└── preferences/    # User preferences subdomain
    ├── fonts.js
    └── settings-ui.js
```

**Pattern**: Use subdirectories for cohesive sub-features within a domain.

## Inconsistencies and Notes

### Current Inconsistencies

1. **Feedback Domain** - Currently just a placeholder. Feedback UI is in `app.js`. Should be moved to feedback domain.

2. **Domain Utils** - Not all domains have a `utils/` subdirectory. Only sessions domain currently has one.

3. **Service Layer** - Only sessions domain has a `-service.js` file. Other domains may benefit from service layer separation.

4. **UI Separation** - Some domains have `-ui.js` files, others don't. Pattern is not consistently applied.

### Migration Notes

- Domains are being established gradually
- Some code may still be in non-domain locations
- New code should follow domain structure strictly
- Existing code should be migrated to appropriate domains

### Best Practices

1. **Start with Domain** - When adding new features, identify the domain first
2. **Use Public API** - Always import from domain `index.js`, not internal files
3. **Keep Domains Focused** - Don't mix concerns across domains
4. **Extract Shared Code** - If code is used by multiple domains, move to `src/shared/`

