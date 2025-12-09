# Error Handling Conventions

This document describes the standardized error handling patterns used throughout the Better Life project.

## Error Handling Module

All error handling goes through the centralized error handler in `src/shared/utils/error-handler.js`.

### Import Pattern

```javascript
import { handleError, withAsyncErrorHandling, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';
```

## Error Severity Levels

### Defined Severities

```javascript
export const ERROR_SEVERITY = {
    CRITICAL: 'critical',  // Breaks functionality
    ERROR: 'error',        // Affects functionality but doesn't break app
    WARNING: 'warning',    // Non-critical issues
    INFO: 'info'           // Debugging information
};
```

### Usage Guidelines

- **CRITICAL**: Use when the application cannot continue functioning
  - Example: Failed to initialize core modules
- **ERROR**: Use for errors that affect functionality but allow the app to continue
  - Example: API call failed, but app can work offline
- **WARNING**: Use for non-critical issues that should be noted
  - Example: Optional feature failed to load
- **INFO**: Use for debugging and informational messages
  - Example: State change notifications

## Error Handling Functions

### `handleError()`

Primary function for logging errors with context.

```javascript
handleError(error, {
    severity: ERROR_SEVERITY.ERROR,
    context: { module: 'auth-ui.js', function: 'handleSignUp' },
    onError: (error, context) => { /* custom handler */ },
    silent: false
});
```

**Parameters:**
- `error` - Error object or error message string
- `options.severity` - Error severity (default: `ERROR`)
- `options.context` - Context object with `module` and `function` properties
- `options.onError` - Optional callback function
- `options.silent` - If true, don't log to console (default: false)

### `withErrorHandling()`

Wraps a synchronous function with error handling.

```javascript
export const myFunction = withErrorHandling(function() {
    // function body
}, {
    functionName: 'myFunction',
    module: 'my-module.js',
    defaultReturn: null,
    onError: (error) => { /* custom handler */ }
});
```

### `withAsyncErrorHandling()`

Wraps an async function with error handling.

```javascript
export const handleSignUp = withAsyncErrorHandling(async function() {
    // async function body
}, {
    functionName: 'handleSignUp',
    module: 'auth-ui.js'
});
```

**Common Pattern:**
- Export wrapped functions directly
- Provide `functionName` and `module` in options
- Let the wrapper handle all error logging

### `safeExecute()` and `safeExecuteAsync()`

Execute functions with error handling, returning a default value on error.

```javascript
const result = safeExecute(() => {
    return riskyOperation();
}, defaultValue, { module: 'my-module.js', function: 'myFunction' });
```

## Error Context

### Standard Context Properties

Always include:
- `module` - The file/module where the error occurred
- `function` - The function name where the error occurred

Optional:
- `data` - Additional context data (e.g., `{ property: 'timerDuration' }`)

### Example Context Objects

```javascript
// Standard context
{ module: 'auth-ui.js', function: 'handleSignUp' }

// With additional data
{ 
    module: 'state-manager.js', 
    function: 'setState', 
    data: { property: 'timerDuration', expectedType: 'number', actualType: 'string' } 
}
```

## Error Handling Patterns

### Pattern 1: Wrapped Function Export

```javascript
export const handleSignUp = withAsyncErrorHandling(async function() {
    // Implementation
    if (error) {
        showAuthMessage('Error message', true);
        return;
    }
    // Success path
}, {
    functionName: 'handleSignUp',
    module: 'auth-ui.js'
});
```

### Pattern 2: Try-Catch with handleError

```javascript
export async function signUpWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { success: true, data: data.user };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signUpWithEmail' }
        });
        return { success: false, error: error.message };
    }
}
```

### Pattern 3: Null Checking with Error Logging

```javascript
function safeGetElementById(id, required = false) {
    const element = document.getElementById(id);
    if (required && !element) {
        handleError(`Required DOM element not found: ${id}`, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'dom-elements.js', elementId: id }
        });
    }
    return element;
}
```

## API Response Error Pattern

### Standard API Response Format

All API functions return `APIResponse<T>`:

```javascript
// Success
{ success: true, data: {...}, message?: string }

// Error
{ success: false, error: string }
```

### Error Handling in API Functions

```javascript
export async function signUpWithEmail(email, password) {
    try {
        // API call
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        return { success: true, data: data.user, message: 'Account created!' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signUpWithEmail' }
        });
        return { success: false, error: error.message };
    }
}
```

## Error Recovery

### Graceful Degradation

When errors occur, provide fallbacks:

```javascript
// Try to load Supabase, but continue if it fails
await withAsyncErrorHandling(
    async () => {
        const supabaseModule = await import('./services/supabase-client.js');
        if (supabaseModule.initAuth) {
            await supabaseModule.initAuth();
        }
    },
    {
        functionName: 'initAuth',
        module: 'app.js',
        onError: () => {
            handleError('Failed to initialize auth (continuing without it)', {
                severity: ERROR_SEVERITY.WARNING,
                context: { module: 'app.js', function: 'initAuth' },
                silent: false
            });
        }
    }
)();
```

## Console Logging

### Severity-Based Logging

The error handler automatically logs based on severity:
- `CRITICAL` → `console.error()` with stack trace
- `ERROR` → `console.error()` with stack trace
- `WARNING` → `console.warn()`
- `INFO` → `console.info()`

### Log Format

```
[SEVERITY] [Module: module.js, Function: functionName] Error message
```

## Inconsistencies and Notes

### Current Inconsistencies

1. **Direct Console Logging** - Some code may still use `console.log()` directly. These should be migrated to use `handleError()` with appropriate severity.

2. **Error Context** - Not all error handling includes full context. Best practice is to always include `module` and `function`.

3. **Error Recovery** - Some functions don't provide graceful degradation. Consider adding fallbacks where appropriate.

4. **Silent Errors** - The `silent` option is rarely used. Consider when errors should be logged vs. handled silently.

### Best Practices

1. **Always Use Error Handler** - Don't use `console.error()` directly
2. **Provide Context** - Always include `module` and `function` in context
3. **Choose Appropriate Severity** - Use the right severity level
4. **Handle Errors Gracefully** - Provide fallbacks when possible
5. **Return Error Responses** - API functions should return error responses, not throw

### Migration Notes

- Legacy code may still use try-catch without `handleError()`
- Some functions may throw errors instead of returning error responses
- New code should follow these patterns strictly

