/**
 * Data migration from localStorage to Supabase
 */

// Temporary import - will be updated when supabase-config.js is split
import * as supabaseModule from '../../supabase-config.js';

/**
 * Check if local data exists and prompt for migration
 */
export function checkAndMigrateLocalStorage() {
    const hasLocalData = localStorage.getItem('bl_timerDuration') ||
        localStorage.getItem('bl_lastDate') ||
        localStorage.getItem('bl_history');

    if (hasLocalData) {
        const migrate = confirm('We found existing data on this device. Would you like to import it to your account?');
        if (migrate) {
            migrateToSupabase();
        } else {
            console.log('User declined migration');
        }
    }
}

/**
 * Migrate local storage data to Supabase
 */
export async function migrateToSupabase() {
    try {
        const timerDuration = parseInt(localStorage.getItem('bl_timerDuration') || '600', 10);
        const lastDate = localStorage.getItem('bl_lastDate');

        // Update profile with timer duration and last session date
        await supabaseModule.updateUserProfile({
            timer_duration: timerDuration,
            last_session_date: lastDate
        });

        // Migrate question history if exists
        const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
        for (const entry of history) {
            if (entry.betterToday) {
                await supabaseModule.saveResponse('better_today', entry.betterToday);
            }
            if (entry.meaning) {
                await supabaseModule.saveResponse('life_meaning', entry.meaning);
            }
        }

        alert('Data imported successfully!');

        // Clear localStorage after successful migration
        localStorage.removeItem('bl_timerDuration');
        localStorage.removeItem('bl_lastDate');
        localStorage.removeItem('bl_history');
    } catch (error) {
        console.error('Migration error:', error);
        alert('Error importing data. Please try again.');
    }
}

