/**
 * Supabase Configuration and Client Setup
 * 
 * This module initializes the Supabase client and provides authentication utilities.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Project Settings > API
 * 3. Copy your project URL and anon/public key
 * 4. Replace the placeholder values below
 */

// TODO: Replace these with your actual Supabase credentials
// Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const SUPABASE_URL = 'https://ftuodzyaxdshogamezvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dW9kenlheGRzaG9nYW1lenZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjkyNTUsImV4cCI6MjA4MDIwNTI1NX0.K8AvAvlzQhOZubO-HpSOquDidpZHaKHHOUIBBnvNch4';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global auth state
export let currentUser = null;
export let isAuthenticated = false;

/**
 * Initialize authentication state and set up listeners
 */
export async function initAuth() {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        currentUser = session.user;
        isAuthenticated = true;
        console.log('User authenticated:', currentUser.email);
    } else {
        currentUser = null;
        isAuthenticated = false;
        console.log('User not authenticated');
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);

        if (session) {
            currentUser = session.user;
            isAuthenticated = true;

            // Trigger custom event for app to respond to
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: { event, user: currentUser, authenticated: true }
            }));
        } else {
            currentUser = null;
            isAuthenticated = false;

            window.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: { event, user: null, authenticated: false }
            }));
        }
    });

    return { user: currentUser, authenticated: isAuthenticated };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, user: data.user, message: 'Account created! Check your email to verify.' };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, user: data.user, message: 'Signed in successfully!' };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in with OAuth provider (Google or GitHub)
 */
export async function signInWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider, // 'google' or 'github'
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, message: `Redirecting to ${provider}...` };
    } catch (error) {
        console.error('OAuth error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send magic link for passwordless authentication
 */
export async function signInWithMagicLink(email) {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, message: 'Check your email for the magic link!' };
    } catch (error) {
        console.error('Magic link error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return { success: true, message: 'Signed out successfully' };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        if (error) throw error;

        return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current user's profile data
 */
export async function getUserProfile() {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user's profile data
 */
export async function updateUserProfile(updates) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save a completed session
 */
export async function saveSession(durationSeconds, journalEntry = null) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                user_id: currentUser.id,
                duration_seconds: durationSeconds,
                journal_entry: journalEntry
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, session: data };
    } catch (error) {
        console.error('Save session error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save a question response
 */
export async function saveResponse(questionType, responseText) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('responses')
            .insert({
                user_id: currentUser.id,
                question_type: questionType,
                response_text: responseText
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, response: data };
    } catch (error) {
        console.error('Save response error:', error);
        return { success: false, error: error.message };
    }
}
