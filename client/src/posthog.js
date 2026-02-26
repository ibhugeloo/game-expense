import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

/**
 * Initialize PostHog analytics.
 * Does nothing if VITE_POSTHOG_KEY is not set (safe for dev).
 */
export function initPostHog() {
    if (!POSTHOG_KEY) {
        console.debug('[PostHog] No API key found, analytics disabled');
        return;
    }

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage',
        autocapture: false, // We track events manually for cleaner data
        disable_session_recording: true, // Enable later if needed
    });
}

/**
 * Identify a user after login/signup.
 */
export function identifyUser(userId, properties = {}) {
    if (!POSTHOG_KEY) return;
    posthog.identify(userId, properties);
}

/**
 * Reset identity on sign out.
 */
export function resetUser() {
    if (!POSTHOG_KEY) return;
    posthog.reset();
}

/**
 * Track a custom event.
 */
export function trackEvent(eventName, properties = {}) {
    if (!POSTHOG_KEY) return;
    posthog.capture(eventName, properties);
}

export default posthog;
