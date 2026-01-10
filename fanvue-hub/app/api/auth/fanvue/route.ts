import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/oauth-helpers';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/lib/config-helper';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const persona = searchParams.get('persona');

        if (!persona) {
            return NextResponse.json({ error: 'Missing persona parameter' }, { status: 400 });
        }

        // 1. Get App Config
        const appConfig = await getAppConfig();
        if (!appConfig.clientId) {
            return NextResponse.json({ error: 'App not configured. Please go to /setup' }, { status: 400 });
        }

        // 2. Security (PKCE & State)
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);

        // State includes persona to know who we are connecting
        const stateRandom = generateState();
        const state = `${persona}:${stateRandom}`;

        // 3. Store Secure Cookies
        const cookieStore = await cookies();

        // Store code_verifier (tied to state or just strict cookie)
        // We will store it with the state as key or validation
        cookieStore.set('oauth_verifier', codeVerifier, {
            httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600
        });

        cookieStore.set('oauth_state', state, {
            httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600
        });

        // Also remember the persona just in case state parsing fails (redundancy)
        cookieStore.set('oauth_persona', persona, {
            httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600
        });

        // 4. Construct URL
        const redirectUri = process.env.OAUTH_REDIRECT_URI || `https://localhost:3001/api/auth/callback`;

        const params = new URLSearchParams({
            client_id: appConfig.clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'read:self read:chat read:media read:post write:chat write:media write:post',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            state: state,
        });

        const issuer = process.env.OAUTH_ISSUER_BASE_URL || 'https://auth.fanvue.com';
        const url = `${issuer}/oauth2/auth?${params.toString()}`;

        console.log('[FanvueAuth] Issuer:', issuer);
        console.log('[FanvueAuth] Redirecting to:', url);

        return NextResponse.redirect(url);

    } catch (error: any) {
        console.error('OAuth Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
