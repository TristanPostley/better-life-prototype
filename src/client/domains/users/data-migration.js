/**
 * Data migration from localStorage to Supabase
 * 
 * @typedef {import('../../../../shared/domains/reflection/types.js').HistoryEntry} HistoryEntry
 * @typedef {import('../../../../shared/domains/users/types.js').ProfileUpdate} ProfileUpdate
 */

import * as supabaseModule from '../../services/supabase-client.js';
import { STORAGE_KEYS, TIMER } from '../../../shared/constants.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

/**
 * Check if local data exists and prompt for migration
 * @returns {void}
 */
export function checkAndMigrateLocalStorage() {
    const hasLocalData = localStorage.getItem(STORAGE_KEYS.TIMER_DURATION) ||
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
 * @returns {Promise<void>}
 */
export async function migrateToSupabase() {
    try {
        const timerDuration = parseInt(localStorage.getItem(STORAGE_KEYS.TIMER_DURATION) || String(TIMER.DEFAULT_DURATION), 10);
        const lastDate = localStorage.getItem('bl_lastDate');

        // Update profile with timer duration and last session date
        const profileResult = await supabaseModule.updateUserProfile({
            timer_duration: timerDuration,
            last_session_date: lastDate
        });

        if (!profileResult.success) {
            throw new Error(profileResult.error || 'Failed to update profile');
        }

        // Migrate question history if exists
        /** @type {HistoryEntry[]} */
        const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
        for (const entry of history) {
            if (entry.betterToday) {
                const result = await supabaseModule.saveResponse('better_today', entry.betterToday);
                if (!result.success) {
                    handleError(`Failed to migrate better_today response: ${result.error}`, {
                        severity: ERROR_SEVERITY.WARNING,
                        context: { module: 'data-migration.js', function: 'migrateToSupabase' }
                    });
                }
            }
            if (entry.meaning) {
                const result = await supabaseModule.saveResponse('life_meaning', entry.meaning);
                if (!result.success) {
                    handleError(`Failed to migrate life_meaning response: ${result.error}`, {
                        severity: ERROR_SEVERITY.WARNING,
                        context: { module: 'data-migration.js', function: 'migrateToSupabase' }
                    });
                }
            }
        }

        alert('Data imported successfully!');

        // Clear localStorage after successful migration
        localStorage.removeItem(STORAGE_KEYS.TIMER_DURATION);
        localStorage.removeItem('bl_lastDate');
        localStorage.removeItem('bl_history');
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'data-migration.js', function: 'migrateToSupabase' },
            onError: () => alert('Error importing data. Please try again.')
        });
    }
}

