import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get access token from cookie
    const accessToken = request.cookies.get('fanvue_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json(
            { error: 'Not authenticated', message: 'Please connect your Fanvue account first' },
            { status: 401 }
        );
    }

    try {
        // Fetch user profile from Fanvue API
        const response = await fetch(`${process.env.API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Fanvue-API-Version': '2025-06-26',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Fanvue API error:', response.status, errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Token expired', message: 'Please reconnect your Fanvue account' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: 'API error', message: 'Failed to fetch profile data' },
                { status: response.status }
            );
        }

        const profileData = await response.json();

        return NextResponse.json({
            success: true,
            profile: profileData,
        });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Server error', message: error.message },
            { status: 500 }
        );
    }
}
