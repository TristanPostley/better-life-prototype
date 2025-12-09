# Naming Conventions

This document describes the naming conventions used throughout the Better Life project.

## File Names

### JavaScript Files

- **kebab-case** for all file names
- Examples: `auth-ui.js`, `timer-service.js`, `dom-elements.js`
- Descriptive names that indicate purpose
- Suffixes for clarity:
  - `-ui.js` - UI handlers and DOM manipulation
  - `-service.js` - Service layer code
  - `.test.js` - Test files

### Type Definition Files

- Named `types.js` within domain directories
- Pattern: `src/shared/domains/{domain}/types.js`
- Global types in `src/shared/types/{category}.js`

### Index Files

- Always named `index.js`
- Used for public API exports in domain modules

## Variable Names

### camelCase

- **Functions**: `initTimer()`, `handleSignUp()`, `getDOMElements()`
- **Variables**: `currentTimer`, `isTimerRunning`, `timerInterval`
- **Constants** (module-level): `cachedElements`, `supabaseInitialized`

### UPPER_SNAKE_CASE

- **True constants** (never reassigned, exported):
  - `ERROR_SEVERITY.CRITICAL`
  - `STORAGE_KEYS.TIMER_DURATION`
  - `CSS_CLASSES.HIDDEN`
  - `TIMER.DEFAULT_DURATION`

### Descriptive Names

- Use full words, not abbreviations (except well-known ones)
- Good: `timerDuration`, `isAuthenticated`, `currentUser`
- Avoid: `td`, `auth`, `usr`

## Function Names

### Prefixes for Clarity

- **`init*`** - Initialization functions: `initTimer()`, `initNavigation()`, `initAuth()`
- **`handle*`** - Event handlers: `handleSignUp()`, `handleStartTimerClick()`
- **`get*`** - Getters/accessors: `getState()`, `getDOMElements()`, `getTimerDuration()`
- **`set*`** - Setters: `setState()`, `setTimerDuration()`, `setCurrentTimer()`
- **`show*`** - Display/show functions: `showPage()`, `showAuthForm()`, `showAuthMessage()`
- **`update*`** - Update functions: `updateStreak()`, `updateTimerDisplay()`
- **`reset*`** - Reset functions: `resetTimerState()`, `resetTimerDisplay()`
- **`with*`** - Wrapper/higher-order functions: `withErrorHandling()`, `withAsyncErrorHandling()`
- **`safe*`** - Safe/null-checking functions: `safeExecute()`, `safeGetElementById()`

### Async Functions

- No special naming for async functions
- Use descriptive names that indicate async behavior in documentation
- Example: `signUpWithEmail()` is async but doesn't need `async` prefix

## Type Names

### JSDoc Type Definitions

- **PascalCase** for type names
- Examples: `AuthResult`, `AppState`, `DOMElements`, `APIResponse`
- Descriptive and specific: `AuthStateChangedEventDetail`, `SuccessResponse`

### Type Parameters

- Single uppercase letters for generics: `APIResponse<T>`, `SuccessResponse<T>`

## DOM Element IDs and Classes

### IDs

- **kebab-case** with descriptive prefixes
- Pattern: `{element-type}-{purpose}`
- Examples:
  - `btn-yes`, `btn-start-timer`, `btn-signup-submit`
  - `timer-display`, `timer-intro`, `circle-timer`
  - `auth-forms`, `signup-form`, `signin-form`
  - `modal-overlay`, `modal-body`, `close-modal`

### CSS Classes

- **kebab-case**
- Semantic names: `hidden`, `fade-in`, `fade-out`, `active-page`
- Utility classes: `auth-btn`, `primary`, `full-width`
- State classes: `dragging`, `show`, `scrollable`

## Module Exports

### Named Exports (Preferred)

- Use named exports for most functions and constants
- Examples:
  ```javascript
  export function initTimer() { }
  export const ERROR_SEVERITY = { };
  ```

### Default Exports

- Avoid default exports (except for classes or major components)
- Current pattern: No default exports in use

## Constants Organization

### Object-Based Constants

- Group related constants in objects
- Examples:
  ```javascript
  export const ERROR_SEVERITY = {
      CRITICAL: 'critical',
      ERROR: 'error',
      WARNING: 'warning'
  };
  
  export const STORAGE_KEYS = {
      TIMER_DURATION: 'bl_timerDuration',
      DARK_MODE: 'bl_darkMode'
  };
  ```

### Access Pattern

- Access via object property: `ERROR_SEVERITY.CRITICAL`
- Destructure when importing: `const { ERROR_SEVERITY } = ...`

## State Properties

### State Object Properties

- **camelCase** for state properties
- Examples: `timerDuration`, `currentTimer`, `isTimerRunning`, `darkMode`
- Boolean properties prefixed with `is*`, `has*`, or `was*`: `isTimerRunning`, `menuTitleHasBeenDismissed`, `wasDragged`

## Error Handling

### Error Context Properties

- Use `module` and `function` in error context
- Examples:
  ```javascript
  handleError(error, {
      context: { module: 'auth-ui.js', function: 'handleSignUp' }
  });
  ```

## LocalStorage Keys

### Prefix Pattern

- All keys prefixed with `bl_` (Better Life)
- Examples: `bl_timerDuration`, `bl_darkMode`, `bl_fontFamily`, `bl_lastDate`
- Defined in `STORAGE_KEYS` constant object

## Inconsistencies and Notes

### Current Inconsistencies

1. **Module Registry** - Uses `moduleRegistry` (camelCase) as a singleton instance name. This is acceptable for singleton instances.

2. **State Object** - The state object itself is named `state` (lowercase). This is a special case for the main state object.

3. **Window Fallbacks** - Some legacy code may still use `window.*` patterns. New code should use module imports and the module registry.

4. **Function Naming** - Some functions don't follow the prefix pattern (e.g., `finishSession()` instead of `handleFinishSession()`). This is acceptable for domain-specific functions where the context is clear.

### Best Practices

1. **Be Consistent** - Once you choose a naming pattern, stick with it throughout the file/module
2. **Be Descriptive** - Names should clearly indicate purpose
3. **Follow Established Patterns** - Match existing code in the same domain
4. **Document Exceptions** - If you must deviate, document why

