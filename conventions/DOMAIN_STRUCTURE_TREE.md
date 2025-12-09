# Domain Structure Tree

Visual representation of the domain-driven structure in the Better Life project.

## Complete Domain Structure

```
src/
├── client/
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── auth-ui.js
│   │   │   └── index.js
│   │   │
│   │   ├── sessions/
│   │   │   ├── timer.js
│   │   │   ├── timer-service.js
│   │   │   ├── streak.js
│   │   │   ├── index.js
│   │   │   └── utils/
│   │   │       ├── progress-ring.js
│   │   │       └── time-format.js
│   │   │
│   │   ├── navigation/
│   │   │   ├── routing.js
│   │   │   ├── modal.js
│   │   │   ├── menu-interactions.js
│   │   │   └── index.js
│   │   │
│   │   ├── reflection/
│   │   │   ├── questions-ui.js
│   │   │   └── index.js
│   │   │
│   │   ├── users/
│   │   │   ├── data-persistence.js
│   │   │   ├── data-migration.js
│   │   │   ├── index.js
│   │   │   └── preferences/
│   │   │       ├── fonts.js
│   │   │       └── settings-ui.js
│   │   │
│   │   └── feedback/
│   │       └── index.js
│   │
│   ├── services/
│   │   └── supabase-client.js
│   │
│   ├── state/
│   │   ├── app-state.js
│   │   └── state-manager.js
│   │
│   └── utils/
│       ├── dom-elements.js
│       ├── dom-helpers.js
│       ├── button-handlers.js
│       └── module-registry.js
│
└── shared/
    ├── types/
    │   ├── api.js
    │   ├── dom.js
    │   └── state.js
    │
    ├── domains/
    │   ├── auth/
    │   │   └── types.js
    │   ├── sessions/
    │   │   └── types.js
    │   ├── reflection/
    │   │   └── types.js
    │   ├── users/
    │   │   └── types.js
    │   └── feedback/
    │       └── types.js
    │
    ├── utils/
    │   ├── error-handler.js
    │   ├── transitions.js
    │   └── index.js
    │
    └── constants.js
```

## Domain Dependencies

### Auth Domain
- **Depends on**: `services/supabase-client.js`, `navigation/modal.js`, `utils/module-registry.js`
- **Provides**: Authentication UI, auth state management
- **Types**: `shared/domains/auth/types.js`

### Sessions Domain
- **Depends on**: `state/app-state.js`, `utils/dom-elements.js`, `shared/constants.js`
- **Provides**: Timer logic, streak tracking, session management
- **Types**: `shared/domains/sessions/types.js`
- **Sub-utilities**: `utils/progress-ring.js`, `utils/time-format.js`

### Navigation Domain
- **Depends on**: `utils/dom-elements.js`, `shared/constants.js`
- **Provides**: Page routing, modal management, menu interactions
- **Types**: None (UI-only)

### Reflection Domain
- **Depends on**: `services/supabase-client.js`, `utils/dom-elements.js`
- **Provides**: Questions UI, response collection
- **Types**: `shared/domains/reflection/types.js`

### Users Domain
- **Depends on**: `state/app-state.js`, `services/supabase-client.js`, `utils/dom-elements.js`
- **Provides**: User data persistence, preferences management
- **Types**: `shared/domains/users/types.js`
- **Subdomain**: `preferences/` (fonts, settings)

### Feedback Domain
- **Depends on**: `services/supabase-client.js` (via app.js)
- **Provides**: Feedback submission (currently minimal)
- **Types**: `shared/domains/feedback/types.js`

## Shared Code Structure

### Types (`src/shared/types/`)
- **api.js** - API response types (used by all API-calling domains)
- **dom.js** - DOM element types (used by all UI domains)
- **state.js** - State types (used by state management)

### Domain Types (`src/shared/domains/`)
- One `types.js` file per domain
- Contains domain-specific type definitions
- Used by both client domain code and potentially server code

### Utilities (`src/shared/utils/`)
- **error-handler.js** - Error handling utilities (used by all domains)
- **transitions.js** - Transition utilities
- **index.js** - Utility exports

### Constants (`src/shared/constants.js`)
- Application-wide constants
- Used by all domains

## Cross-Domain Relationships

```
app.js (entry point)
├── domains/auth/
├── domains/sessions/
├── domains/navigation/
├── domains/reflection/
├── domains/users/
└── domains/feedback/

Shared dependencies:
├── shared/utils/error-handler.js
├── shared/constants.js
├── services/supabase-client.js
└── state/app-state.js
```

## Domain Import Patterns

### Domain to Domain
```javascript
// In sessions domain, importing from navigation
import { showPage } from '../navigation/index.js';
```

### Domain to Shared
```javascript
// In any domain
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';
import { STORAGE_KEYS } from '../../../shared/constants.js';
```

### Domain to Services
```javascript
// In auth domain
import * as supabaseModule from '../../services/supabase-client.js';
```

### Domain to State
```javascript
// In sessions domain
import { getState, setState } from '../../state/app-state.js';
```

## Notes

- **Entry Point**: `src/client/app.js` imports from all domains
- **Public APIs**: Each domain exports via `index.js`
- **Types**: Domain types are in `src/shared/domains/{domain}/types.js`
- **Utilities**: Domain-specific utils in `{domain}/utils/`, shared utils in `src/shared/utils/`
- **Subdomains**: Nested features use subdirectories (e.g., `users/preferences/`)

