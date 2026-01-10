import { randomBytes, createHash } from 'crypto';

/**
 * OAuth 2.0 PKCE Helper Functions
 */

export function generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(verifier: string): string {
    return createHash('sha256')
        .update(verifier)
        .digest('base64url');
}

export function generateState(): string {
    return randomBytes(32).toString('hex');
}
