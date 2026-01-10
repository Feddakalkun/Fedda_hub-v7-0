import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.html(
                `<h1>Error</h1><p>TikTok error: ${error}</p><script>window.close();</script>`,
                { status: 400 }
            );
        }

        const storedState = request.cookies.get('tiktok_oauth_state')?.value;
        const codeVerifier = request.cookies.get('tiktok_code_verifier')?.value;

        if (!state || state !== storedState) {
            return NextResponse.html(
                '<h1>Error</h1><p>CSRF mismatch. Please try again.</p><script>window.close();</script>',
                { status: 400 }
            );
        }

        if (!code || !codeVerifier) {
            return NextResponse.html(
                '<h1>Error</h1><p>Missing auth data. Please try again.</p><script>window.close();</script>',
                { status: 400 }
            );
        }

        // Extract persona from state (format: "persona:random")
        const [personaSlug] = state.split(':');

        if (!personaSlug) {
            return NextResponse.html(
                '<h1>Error</h1><p>Missing persona context.</p><script>window.close();</script>',
                { status: 400 }
            );
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://open.tiktok.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_key: process.env.TIKTOK_CLIENT_KEY!,
                client_secret: process.env.TIKTOK_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
                code_verifier: codeVerifier
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('TikTok error:', tokenData);
            return NextResponse.html(
                `<h1>Error</h1><p>${tokenData.error_description || 'Token exchange failed'}</p><script>window.close();</script>`,
                { status: 400 }
            );
        }

        const { access_token, refresh_token, expires_in, open_id } = tokenData;

        // Get user info
        const userResponse = await fetch('https://open.tiktok.com/v1/user/info', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const userData = await userResponse.json();
        const userInfo = userData.data?.user;

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Find character
        const character = await prisma.character.findUnique({
            where: { slug: personaSlug }
        });

        if (!character) {
            return NextResponse.html(
                '<h1>Error</h1><p>Character not found</p><script>window.close();</script>',
                { status: 404 }
            );
        }

        // Save to database
        await prisma.tikTokConnection.upsert({
            where: { characterId: character.id },
            create: {
                characterId: character.id,
                tiktokUserId: open_id,
                tiktokUsername: userInfo?.display_name || 'TikTok User',
                tiktokDisplayName: userInfo?.display_name || 'TikTok User',
                tiktokAvatar: userInfo?.avatar_url || '',
                accessToken: access_token,
                refreshToken: refresh_token || '',
                expiresIn: expires_in,
                expiresAt,
                autoPostEnabled: true
            },
            update: {
                tiktokUserId: open_id,
                tiktokUsername: userInfo?.display_name || 'TikTok User',
                tiktokDisplayName: userInfo?.display_name || 'TikTok User',
                tiktokAvatar: userInfo?.avatar_url || '',
                accessToken: access_token,
                refreshToken: refresh_token || '',
                expiresIn: expires_in,
                expiresAt,
                lastTokenRefresh: new Date()
            }
        });

        // Success page + auto-close popup
        // We clear cookies here too
        const response = NextResponse.html(
            `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#111;color:white;">
        <h1 style="color:#4ade80">✅ Connected!</h1>
        <p>@${userInfo?.display_name || 'User'} connected to ${character.name}</p>
        <p style="color:#666;font-size:12px">Closing window...</p>
      </div>
      <script>
        setTimeout(() => {
          if (window.opener) {
             // Optional: notify opener directly if needed, but polling handles it
          }
          window.close();
        }, 1500);
      </script>
      `,
            { status: 200 }
        );

        response.cookies.delete('tiktok_oauth_state');
        response.cookies.delete('tiktok_code_verifier');

        return response;

    } catch (error) {
        console.error('TikTok callback error:', error);
        return NextResponse.html(
            '<h1>Error</h1><p>Authentication failed</p><script>window.close();</script>',
            { status: 500 }
        );
    }
}
