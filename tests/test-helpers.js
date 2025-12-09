/**
 * Minimal test helpers
 * Simple assertion-based testing without external dependencies
 */

let testCount = 0;
let passCount = 0;
let failCount = 0;
const failures = [];

export function assert(condition, message) {
    testCount++;
    if (condition) {
        passCount++;
        console.log(`✓ ${message}`);
    } else {
        failCount++;
        const error = `✗ ${message}`;
        failures.push(error);
        console.error(error);
    }
}

export function describe(name, fn) {
    console.log(`\n${name}`);
    console.log('─'.repeat(name.length));
    try {
        fn();
    } catch (error) {
        console.error(`Error in ${name}:`, error);
        failures.push(`Error in ${name}: ${error.message}`);
    }
}

export function it(name, fn) {
    try {
        fn();
    } catch (error) {
        console.error(`  Error in test "${name}":`, error);
        failures.push(`  Error in test "${name}": ${error.message}`);
        failCount++;
    }
}

export function runTests() {
    console.log('\n' + '='.repeat(50));
    console.log('Test Results');
    console.log('='.repeat(50));
    console.log(`Total: ${testCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (failures.length > 0) {
        console.log('\nFailures:');
        failures.forEach(f => console.error(f));
        process.exit(1);
    } else {
        console.log('\nAll tests passed! ✓');
        process.exit(0);
    }
}

