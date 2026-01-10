import { NextRequest, NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/oauth-helpers';

export async function GET(request: NextRequest) {
    // Debug: Log environment variables
    console.log('OAuth Config:', {
        issuer: process.env.OAUTH_ISSUER_BASE_URL,
        clientId: process.env.OAUTH_CLIENT_ID?.substring(0, 10) + '...',
        redirectUri: process.env.OAUTH_REDIRECT_URI,
    });

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Build authorization URL
    const issuerBaseUrl = process.env.OAUTH_ISSUER_BASE_URL || 'https://auth.fanvue.com';
    const authUrl = new URL(`${issuerBaseUrl}/oauth2/auth`);
    authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID || '');
    authUrl.searchParams.set('redirect_uri', process.env.OAUTH_REDIRECT_URI || '');
    authUrl.searchParams.set('response_type', 'code');
    // Use only scopes that Fanvue supports (from OAuth settings page)
    authUrl.searchParams.set('scope', 'read:self read:chat read:media read:post write:chat write:media write:post');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('Redirecting to:', authUrl.toString());
    console.log('OAuth Parameters:', {
        client_id: authUrl.searchParams.get('client_id'),
        redirect_uri: authUrl.searchParams.get('redirect_uri'),
        response_type: authUrl.searchParams.get('response_type'),
        scope: authUrl.searchParams.get('scope'),
        state: authUrl.searchParams.get('state')?.substring(0, 20) + '...',
        code_challenge: authUrl.searchParams.get('code_challenge')?.substring(0, 20) + '...',
        code_challenge_method: authUrl.searchParams.get('code_challenge_method'),
    });

    // Create response with redirect
    const response = NextResponse.redirect(authUrl.toString());

    // Store code_verifier and state in HTTP-only cookies
    response.cookies.set('oauth_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });

    response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });

    return response;
}
