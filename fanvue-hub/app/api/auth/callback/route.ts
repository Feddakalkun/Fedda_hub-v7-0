import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/lib/config-helper';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.json({ error: `Fanvue Error: ${error}` }, { status: 400 });
        }

        if (!code || !state) {
            return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const savedState = cookieStore.get('oauth_state')?.value;
        const codeVerifier = cookieStore.get('oauth_verifier')?.value;

        // 1. Validate State
        if (state !== savedState) {
            return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
        }

        if (!codeVerifier) {
            return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
        }

        // 2. Extract Persona from state (format: "slug:random")
        const [slug] = state.split(':');
        if (!slug) {
            return NextResponse.json({ error: 'Invalid state format (missing persona)' }, { status: 400 });
        }

        // 3. Get Credentials via Helper
        const config = await getAppConfig();
        if (!config.clientId || !config.clientSecret) {
            return NextResponse.json({ error: 'App configuration missing' }, { status: 500 });
        }

        // 4. Exchange Code
        const redirectUri = process.env.OAUTH_REDIRECT_URI || `https://localhost:3001/api/auth/callback`;

        // Prepare Basic Auth Header
        const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

        const tokenResponse = await fetch('https://auth.fanvue.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
                'Accept': 'application/json',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token Exchange Error:', tokenData);
            return NextResponse.json({ error: 'Token exchange failed', details: tokenData }, { status: 400 });
        }

        // 5. Update Character in DB
        const character = await prisma.character.findUnique({ where: { slug } });
        if (!character) {
            return NextResponse.json({ error: `Character '${slug}' not found` }, { status: 404 });
        }

        // Calculate expiry
        const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

        await prisma.character.update({
            where: { slug },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenExpiresAt: expiresAt,
            }
        });

        // 6. Cleanup Cookies
        cookieStore.delete('oauth_state');
        cookieStore.delete('oauth_verifier');
        cookieStore.delete('oauth_persona');

        // 7. Redirect to Character Dashboard
        return NextResponse.redirect(`https://localhost:3001/characters/${slug}`);

    } catch (error: any) {
        console.error('Callback Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
