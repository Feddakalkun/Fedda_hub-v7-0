import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

/**
 * Test endpoint to verify Fanvue API connection and token validity
 */
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('fanvue_access_token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'No Fanvue access token found',
                step: 'token_check'
            }, { status: 401 });
        }

        console.log('[Test Connection] Token found, length:', token.length);
        console.log('[Test Connection] Token preview:', token.substring(0, 20) + '...');

        const client = new FanvueClient(token);

        // Test 1: Get current user (basic auth check)
        console.log('[Test Connection] Testing GET /users/me...');
        let user;
        try {
            user = await client.getCurrentUser();
            console.log('[Test Connection] ✅ GET /users/me successful');
            console.log('[Test Connection] User data:', JSON.stringify(user, null, 2));
        } catch (e: any) {
            console.error('[Test Connection] ❌ GET /users/me failed');
            console.error('[Test Connection] Error:', e.message);
            if (e.response) {
                console.error('[Test Connection] Status:', e.response.status);
                console.error('[Test Connection] Data:', JSON.stringify(e.response.data, null, 2));
            }
            return NextResponse.json({
                success: false,
                error: `Failed to get user: ${e.message}`,
                step: 'get_user',
                statusCode: e.response?.status,
                details: e.response?.data
            }, { status: 500 });
        }

        // Test 2: Try to create an upload session (without actually uploading)
        console.log('[Test Connection] Testing POST /media/uploads...');
        try {
            const testFilename = 'test_connection_probe.png';
            const uploadSessionResponse = await client['client'].post('/media/uploads', {
                name: 'test_connection_probe',
                filename: testFilename,
                mediaType: 'image',
            });

            console.log('[Test Connection] ✅ POST /media/uploads successful');
            console.log('[Test Connection] Upload session:', JSON.stringify(uploadSessionResponse.data, null, 2));

            // Clean up - we don't actually want to complete this upload
            return NextResponse.json({
                success: true,
                message: 'Fanvue API connection is working!',
                tests: {
                    getUserMe: { success: true, user },
                    mediaUploadSession: { success: true, data: uploadSessionResponse.data }
                }
            });
        } catch (e: any) {
            console.error('[Test Connection] ❌ POST /media/uploads failed');
            console.error('[Test Connection] Error:', e.message);
            if (e.response) {
                console.error('[Test Connection] Status:', e.response.status);
                console.error('[Test Connection] Data:', JSON.stringify(e.response.data, null, 2));
                console.error('[Test Connection] Headers:', e.response.headers);
                console.error('[Test Connection] Request URL:', e.config?.url);
                console.error('[Test Connection] Request Method:', e.config?.method);
                console.error('[Test Connection] Request Headers:', e.config?.headers);
            }

            return NextResponse.json({
                success: false,
                error: `Media upload session creation failed: ${e.message}`,
                step: 'create_upload_session',
                statusCode: e.response?.status,
                details: e.response?.data,
                tests: {
                    getUserMe: { success: true, user },
                    mediaUploadSession: {
                        success: false,
                        error: e.message,
                        status: e.response?.status,
                        data: e.response?.data
                    }
                }
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[Test Connection] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            step: 'unexpected'
        }, { status: 500 });
    }
}
