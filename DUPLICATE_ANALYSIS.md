# Duplicate Code Analysis

This document identifies duplicated helpers, utilities, and functions across the codebase and recommends which should serve as the single source of truth.

## Summary

Many domain files are currently empty (0 bytes) following the migration. The analysis below focuses on populated files and patterns that exist or will need consolidation.

---

## 1. Error Result Object Pattern

**Duplication:** The pattern `{ success: boolean, error?: string, message?: string, ...data }` is repeated throughout `supabase-config.js`.

**Locations:**
- `supabase-config.js:131` - `signUpWithEmail()`
- `supabase-config.js:150` - `signInWithEmail()`
- `supabase-config.js:171` - `signInWithOAuth()`
- `supabase-config.js:192` - `signInWithMagicLink()`
- `supabase-config.js:208` - `signOut()`
- `supabase-config.js:226` - `resetPassword()`
- `supabase-config.js:250` - `getUserProfile()`
- `supabase-config.js:275` - `updateUserProfile()`
- `supabase-config.js:303` - `saveSession()`
- `supabase-config.js:331` - `saveResponse()`
- `supabase-config.js:354` - `submitFeedback()`

**Current Pattern:**
```javascript
try {
    // ... operation ...
    if (error) throw error;
    return { success: true, ...data };
} catch (error) {
    console.error('Operation error:', error);
    return { success: false, error: error.message };
}
```

**Recommendation:**
- **Single Source:** Create `domains/shared/utils/error-handling.js` with a helper function:
  ```javascript
  export function createResult(success, data = {}, error = null) {
      if (success) {
          return { success: true, ...data };
      }
      return { success: false, error: error?.message || error || 'Unknown error' };
  }
  
  export function wrapAsyncOperation(operationName, operationFn) {
      return async (...args) => {
          try {
              const result = await operationFn(...args);
              return createResult(true, result);
          } catch (error) {
              console.error(`${operationName} error:`, error);
              return createResult(false, {}, error);
          }
      };
  }
  ```
- **Keep:** All functions in `supabase-config.js` should use these helpers after refactoring.

---

## 2. Authentication Check Pattern

**Duplication:** The check `if (!isAuthenticated) { return { success: false, error: 'Not authenticated' }; }` appears multiple times.

**Locations:**
- `supabase-config.js:234-236` - `getUserProfile()`
- `supabase-config.js:258-260` - `updateUserProfile()`
- `supabase-config.js:283-285` - `saveSession()`
- `supabase-config.js:311-313` - `saveResponse()`

**Recommendation:**
- **Single Source:** Create `domains/shared/utils/auth-helper.js`:
  ```javascript
  import { isAuthenticated } from '../../supabase-config.js';
  
  export function requireAuth() {
      if (!isAuthenticated) {
          return { success: false, error: 'Not authenticated' };
      }
      return null; // No error, authenticated
  }
  ```
- **Keep:** The check should remain in each function, but use the helper for consistency.

---

## 3. localStorage Access Pattern

**Duplication:** Direct `localStorage.getItem()` and `localStorage.setItem()` calls are scattered.

**Locations:**
- `app.js:28` - Dark mode check: `localStorage.getItem('bl_darkMode')`
- `domains/users/preferences/fonts.js:22` - Font retrieval: `localStorage.getItem('bl_fontFamily')`
- `domains/users/preferences/fonts.js:32` - Font retrieval (duplicate in same file)
- `domains/users/preferences/fonts.js:59` - Font save: `localStorage.setItem('bl_fontFamily', ...)`

**Note:** Based on conventions and worktree references, there are likely more localStorage patterns in empty domain files:
- `bl_timerDuration`
- `bl_lastDate`
- `bl_history`
- `bl_darkMode`
- `bl_fontFamily`

**Recommendation:**
- **Single Source:** Create `domains/shared/utils/storage.js`:
  ```javascript
  const STORAGE_PREFIX = 'bl_';
  
  export function storageGet(key, defaultValue = null) {
      try {
          const value = localStorage.getItem(STORAGE_PREFIX + key);
          return value ? JSON.parse(value) : defaultValue;
      } catch (error) {
          console.error(`Error reading localStorage key "${key}":`, error);
          return defaultValue;
      }
  }
  
  export function storageSet(key, value) {
      try {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
          return true;
      } catch (error) {
          console.error(`Error writing localStorage key "${key}":`, error);
          return false;
      }
  }
  
  export function storageRemove(key) {
      try {
          localStorage.removeItem(STORAGE_PREFIX + key);
          return true;
      } catch (error) {
          console.error(`Error removing localStorage key "${key}":`, error);
          return false;
      }
  }
  ```
- **Keep:** All localStorage access should go through these helpers.

---

## 4. Date Formatting/Comparison

**Duplication:** Date creation and formatting appears in multiple patterns.

**Locations:**
- `supabase-config.js:265` - `new Date().toISOString()` for `updated_at`
- Multiple references to `new Date().toDateString()` for date comparisons (streak logic, likely in empty files)
- `new Date().toISOString()` for timestamps (likely in empty files)

**Patterns Found:**
- `new Date().toDateString()` - For date comparisons (streaks, session dates)
- `new Date().toISOString()` - For timestamps and database records

**Recommendation:**
- **Single Source:** Create `domains/shared/utils/date.js`:
  ```javascript
  export function getTodayDateString() {
      return new Date().toDateString();
  }
  
  export function getCurrentTimestamp() {
      return new Date().toISOString();
  }
  
  export function isSameDate(dateString1, dateString2) {
      return dateString1 === dateString2;
  }
  
  export function isToday(dateString) {
      return dateString === getTodayDateString();
  }
  ```
- **Keep:** All date operations should use these utilities.

---

## 5. DOM Query Patterns

**Status:** ✅ **Already Consolidated**

**Location:**
- `domains/shared/utils/dom.js` - Single `getDOMElements()` function with caching

**Note:** However, there are direct DOM queries in some files:
- `domains/users/preferences/fonts.js:40` - `document.getElementById('font-select')`
- `domains/users/preferences/fonts.js:64` - `querySelectorAll('option')`

**Recommendation:**
- **Single Source:** Keep using `getDOMElements()` from `domains/shared/utils/dom.js`
- **Action:** Add `fontSelect` and other settings elements to the cached DOM elements object in `dom.js`
- **Remove:** Direct `getElementById` calls in `fonts.js` should use the cached DOM object

---

## 6. Font Retrieval Logic

**Duplication:** Font retrieval logic appears twice in the same file.

**Location:**
- `domains/users/preferences/fonts.js:22` - In `applyFont()`
- `domains/users/preferences/fonts.js:32` - In `getCurrentFont()`

**Current Code:**
```javascript
// Line 22
const savedFont = localStorage.getItem('bl_fontFamily');
const fontValue = savedFont || availableFonts[0].value;

// Line 32
const savedFont = localStorage.getItem('bl_fontFamily');
return savedFont || availableFonts[0].value;
```

**Recommendation:**
- **Single Source:** `getCurrentFont()` should be the source of truth
- **Action:** Update `applyFont()` to call `getCurrentFont()`:
  ```javascript
  export function applyFont() {
      const fontValue = getCurrentFont();
      document.documentElement.style.setProperty('--font-family', fontValue);
  }
  ```

---

## 7. Supabase Query Pattern

**Duplication:** Similar Supabase query patterns with error handling.

**Locations:**
- `supabase-config.js:239-250` - Profile SELECT query
- `supabase-config.js:263-275` - Profile UPDATE query
- `supabase-config.js:288-303` - Session INSERT query
- `supabase-config.js:316-331` - Response INSERT query

**Pattern:**
```javascript
const { data, error } = await supabase
    .from('table')
    .operation(...)
    .eq('id', currentUser.id)
    .select()
    .single();

if (error) throw error;
return { success: true, ...data };
```

**Recommendation:**
- **Single Source:** Create `domains/shared/services/supabase-query.js` with query builder helpers (after splitting `supabase-config.js` as planned):
  ```javascript
  export async function querySingle(table, filter, operation = 'select') {
      // Helper to reduce boilerplate
  }
  
  export async function insertSingle(table, data) {
      // Helper for inserts
  }
  
  export async function updateSingle(table, filter, updates) {
      // Helper for updates
  }
  ```
- **Keep:** These patterns should be consolidated into service layer helpers.

---

## 8. Empty Domain Files

**Status:** ⚠️ **Files Exist But Are Empty**

**Empty Files (0 bytes):**
- `domains/auth/auth-ui.js`
- `domains/auth/index.js`
- `domains/feedback/index.js`
- `domains/navigation/index.js`
- `domains/navigation/menu-interactions.js`
- `domains/navigation/modal.js`
- `domains/navigation/routing.js`
- `domains/reflection/index.js`
- `domains/reflection/questions-ui.js`
- `domains/sessions/index.js`
- `domains/sessions/streak.js`
- `domains/sessions/timer.js`
- `domains/users/data-migration.js`
- `domains/users/data-persistence.js`
- `domains/users/index.js`
- `domains/users/preferences/settings-ui.js`

**Recommendation:**
- **Action Required:** These files need to be populated with the actual code from the migration source (likely in the worktree at `C:\Users\tpost\.cursor\worktrees\Better_Life\jiy\`)
- **Priority:** Before deduplication can be fully analyzed, these files should be populated

---

## Priority Recommendations

### High Priority (Do First)

1. **Populate Empty Domain Files** - Cannot analyze duplicates until code exists
2. **Create localStorage Helper** (`domains/shared/utils/storage.js`) - Used everywhere
3. **Create Date Utilities** (`domains/shared/utils/date.js`) - Used for streaks/sessions

### Medium Priority

4. **Create Error Handling Helpers** (`domains/shared/utils/error-handling.js`) - Reduce boilerplate
5. **Refactor Font Logic** - Remove duplication in `fonts.js`
6. **Consolidate DOM Queries** - Move remaining direct queries to cached DOM object

### Low Priority (Future Refactoring)

7. **Create Supabase Query Helpers** - After splitting `supabase-config.js` into domain services
8. **Create Auth Helper** - Simplify authentication checks

---

## Notes

- Many functions in `supabase-config.js` should eventually be split into domain-specific services (auth, sessions, users, feedback) as per the domain structure proposal
- The `supabase-config.js` file is a monolith that contains multiple responsibilities and will need splitting before full deduplication
- After populating empty domain files, additional duplicates may be discovered that aren't visible in this analysis

