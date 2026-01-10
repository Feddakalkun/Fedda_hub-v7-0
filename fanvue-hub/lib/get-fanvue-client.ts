/**
 * Helper to get FanvueClient instance with proper authentication
 * Supports both OAuth token and cookie-based auth
 */

import { FanvueClient } from './fanvue-client';
import { cookies } from 'next/headers';

interface GetClientOptions {
    persona?: 'emily' | 'thale';
    preferCookies?: boolean;
}

/**
 * Get authenticated Fanvue client
 * Priority: 1) Persona cookies, 2) OAuth token, 3) Error
 */
export async function getFanvueClient(options: GetClientOptions = {}): Promise<FanvueClient> {
    const { persona, preferCookies = true } = options;

    // Try persona-specific cookie files first
    if (preferCookies && persona) {
        try {
            const client = FanvueClient.forPersona(persona);
            console.log(`[getFanvueClient] Using ${persona} cookie authentication`);
            return client;
        } catch (error) {
            console.warn(`[getFanvueClient] Failed to load ${persona} cookies:`, error);
        }
    }

    // Fall back to OAuth token
    const cookieStore = await cookies();
    const token = cookieStore.get('fanvue_access_token')?.value;

    if (token) {
        console.log('[getFanvueClient] Using OAuth token authentication');
        return new FanvueClient(token);
    }

    throw new Error('No Fanvue authentication available. Please connect Fanvue or ensure persona cookie files exist.');
}

/**
 * Detect persona from request context
 * Checks: 1) Explicit persona param, 2) Referer header (/emily or /thale), 3) Default
 */
export function detectPersona(request: Request): 'emily' | 'thale' | undefined {
    // Check query params or body
    const url = new URL(request.url);
    const personaParam = url.searchParams.get('persona');

    if (personaParam === 'emily' || personaParam === 'thale') {
        return personaParam;
    }

    // Check referer
    const referer = request.headers.get('referer') || '';
    if (referer.includes('/emily')) {
        return 'emily';
    }
    if (referer.includes('/thale')) {
        return 'thale';
    }

    return undefined;
}
