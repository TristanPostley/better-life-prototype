# Imports and Dependencies Conventions

This document describes the import patterns and dependency management conventions used in the Better Life project.

## Module System

The project uses **ES6 modules** (`import`/`export`) exclusively. All JavaScript files are ES modules.

### Module Type Declaration

All modules are ES modules (no CommonJS). The project uses:
- `package.json` with `"type": "module"`
- `.js` files with ES6 import/export syntax
- No `.mjs` extension needed

## Import Patterns

### Import Order

Imports should be organized in this order:

1. **External dependencies** (third-party libraries)
2. **Shared utilities and constants**
3. **Type imports** (JSDoc typedefs)
4. **Domain modules**
5. **Local utilities** (same directory level)

### Example Import Order

```javascript
// 1. External dependencies
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 2. Shared utilities and constants
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';
import { STORAGE_KEYS, TIMER } from '../../../shared/constants.js';

// 3. Type imports (JSDoc - no runtime import needed, just for documentation)
/**
 * @typedef {import('../../../shared/domains/auth/types.js').AuthResult} AuthResult
 */

// 4. Domain modules
import { openModal, closeModal } from '../navigation/modal.js';
import { getState, setState } from '../../state/app-state.js';

// 5. Local utilities
import { getDOMElements } from '../../utils/dom-elements.js';
```

## Import Styles

### Named Imports (Preferred)

```javascript
import { initTimer, handleStartTimerClick } from './domains/sessions/index.js';
import { ERROR_SEVERITY, STORAGE_KEYS } from '../../shared/constants.js';
```

### Namespace Imports

Use when importing many items from a module:

```javascript
import * as supabaseModule from '../../services/supabase-client.js';
// Usage: supabaseModule.signUpWithEmail()
```

### Default Imports

**Avoid default exports** - the project uses named exports exclusively.

### Dynamic Imports

Use for optional dependencies or code splitting:

```javascript
// Lazy load optional module
const supabaseModule = await import('./services/supabase-client.js');
if (supabaseModule.initAuth) {
    await supabaseModule.initAuth();
}
```

## Path Conventions

### Relative Paths

Use relative paths for imports within the project:

```javascript
// Same directory
import { helper } from './helper.js';

// Parent directory
import { util } from '../util.js';

// Multiple levels
import { constant } from '../../../shared/constants.js';
```

### Path Depth Guidelines

- **1-2 levels**: Common (same domain or immediate parent)
- **3+ levels**: Acceptable but consider if structure could be improved
- **Absolute paths**: Not used (no path aliases configured)

### Common Import Paths

```javascript
// From client domain to shared
import { ... } from '../../../shared/utils/error-handler.js';
import { ... } from '../../../shared/constants.js';

// From client domain to another domain
import { ... } from '../navigation/modal.js';

// From client domain to utils
import { ... } from '../../utils/dom-elements.js';

// From client domain to state
import { ... } from '../../state/app-state.js';
```

## Dependency Management

### Module Registry Pattern

For cross-module dependencies that can't use direct imports, use the module registry:

```javascript
// Register a dependency
import { moduleRegistry } from '../../utils/module-registry.js';
moduleRegistry.register('finishSession', finishSession);

// Access a dependency
const finishSession = moduleRegistry.get('finishSession');
```

### When to Use Module Registry

- Functions that need to be called from inline scripts (temporary)
- Circular dependency workarounds
- Dynamic dependencies that may not be loaded yet

### When to Use Direct Imports

- **Preferred**: Always use direct imports when possible
- Static dependencies should always use direct imports
- Same-domain dependencies should use direct imports

## External Dependencies

### CDN Imports

Some dependencies are loaded from CDN (e.g., Supabase):

```javascript
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
```

### npm Packages

Dependencies listed in `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.86.0"
  }
}
```

**Note**: Currently, Supabase is loaded from CDN at runtime rather than bundled. This is a temporary pattern.

## Type Imports (JSDoc)

### Typedef Imports

Type definitions are imported using JSDoc comments (no runtime import):

```javascript
/**
 * @typedef {import('../../../shared/domains/auth/types.js').AuthFormType} AuthFormType
 * @typedef {import('../../../shared/types/api.js').APIResponse} APIResponse
 */
```

### Type Import Pattern

```javascript
/**
 * @typedef {import('../../path/to/types.js').TypeName} TypeName
 */
```

## Circular Dependencies

### Prevention

- Structure code to avoid circular dependencies
- Use the module registry for cases where circular dependencies are unavoidable
- Extract shared code to a common module

### Detection

If you encounter circular dependency issues:
1. Refactor to remove the circular dependency
2. Use the module registry as a last resort
3. Document why the circular dependency exists

## Dependency Injection

### Current Pattern

The project doesn't use formal dependency injection. Dependencies are:
- Imported directly (preferred)
- Accessed via module registry (when needed)
- Passed as function parameters (when appropriate)

## Inconsistencies and Notes

### Current Inconsistencies

1. **Window Fallbacks** - Some code still checks `window.*` for backward compatibility:
   ```javascript
   const renderSettings = moduleRegistry.get('renderSettingsModal') || window.renderSettingsModal;
   ```
   This is temporary during migration.

2. **Dynamic Imports** - Some modules use dynamic imports for optional dependencies. This is acceptable but should be documented.

3. **CDN vs npm** - Supabase is loaded from CDN rather than bundled. This may change in the future.

4. **Path Length** - Some imports have deep relative paths (3+ levels). Consider if structure could be improved.

### Best Practices

1. **Use Named Exports** - Always use named exports, avoid default exports
2. **Organize Imports** - Follow the import order convention
3. **Prefer Direct Imports** - Use direct imports over module registry when possible
4. **Document Type Imports** - Use JSDoc typedef imports for type information
5. **Avoid Circular Dependencies** - Structure code to prevent circular dependencies

### Migration Notes

- Legacy code may still use `window.*` patterns
- Some modules may have inconsistent import styles
- New code should follow these conventions strictly

