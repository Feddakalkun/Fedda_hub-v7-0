import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !redirectUri) {
        return NextResponse.json(
            { error: 'TikTok credentials not configured' },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);
    const persona = searchParams.get('persona');

    if (!persona) {
        return NextResponse.json({ error: 'Persona is required' }, { status: 400 });
    }

    // Generate PKCE challenge
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    const stateRandom = crypto.randomBytes(16).toString('hex');
    const state = `${persona}:${stateRandom}`;

    const authUrl = new URL('https://www.tiktok.com/oauth/authorize');
    authUrl.searchParams.set('client_key', clientKey);
    authUrl.searchParams.set('scope', 'user.info.basic,video.publish,video.list,analytics.video.query');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    const response = NextResponse.redirect(authUrl.toString());

    // Store in cookies (will be read by callback)
    response.cookies.set('tiktok_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600
    });

    response.cookies.set('tiktok_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600
    });

    return response;
}
