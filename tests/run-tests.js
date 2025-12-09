/**
 * Test Runner
 * 
 * Runs all guardrail tests and reports results
 * 
 * Usage: node tests/run-tests.js
 */

import { runTests } from './test-helpers.js';

// Import test files (they register tests when imported)
await import('./api-response-guards.test.js');
await import('./utils-guards.test.js');
await import('./guardrails.test.js');

// Run all tests
runTests();

