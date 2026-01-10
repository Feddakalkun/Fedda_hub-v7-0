import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

/**
 * Advanced test endpoint - tests the FULL upload flow step-by-step
 */
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('fanvue_access_token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'No Fanvue access token found'
            }, { status: 401 });
        }

        const client = new FanvueClient(token);
        const results: any = { steps: [] };

        // Step 1: Create upload session
        console.log('[Upload Test] Step 1: Creating upload session...');
        let uploadSession;
        try {
            const uploadSessionResponse = await client['client'].post('/media/uploads', {
                name: 'upload_flow_test',
                filename: 'upload_flow_test.png',
                mediaType: 'image',
            });
            uploadSession = uploadSessionResponse.data;
            results.steps.push({
                step: 1,
                name: 'create_upload_session',
                success: true,
                data: uploadSession
            });
            console.log('[Upload Test] ✅ Step 1 successful:', JSON.stringify(uploadSession, null, 2));
        } catch (e: any) {
            results.steps.push({
                step: 1,
                name: 'create_upload_session',
                success: false,
                error: e.message,
                status: e.response?.status,
                data: e.response?.data
            });
            console.error('[Upload Test] ❌ Step 1 failed:', e.message);
            return NextResponse.json({ success: false, results }, { status: 500 });
        }

        const { mediaUuid, uploadId } = uploadSession;

        // Step 2: Get presigned URL for part 1
        console.log('[Upload Test] Step 2: Getting presigned URL...');
        console.log('[Upload Test] Upload ID:', uploadId);
        const partNumber = 1;

        try {
            const presignedUrlResponse = await client['client'].get(
                `/media/uploads/${uploadId}/parts/${partNumber}`
            );

            results.steps.push({
                step: 2,
                name: 'get_presigned_url',
                success: true,
                data: presignedUrlResponse.data,
                requestUrl: `/media/uploads/${uploadId}/parts/${partNumber}`
            });
            console.log('[Upload Test] ✅ Step 2 successful:', JSON.stringify(presignedUrlResponse.data, null, 2));
        } catch (e: any) {
            results.steps.push({
                step: 2,
                name: 'get_presigned_url',
                success: false,
                error: e.message,
                status: e.response?.status,
                data: e.response?.data,
                requestUrl: `/media/uploads/${uploadId}/parts/${partNumber}`,
                fullUrl: e.config?.url
            });
            console.error('[Upload Test] ❌ Step 2 failed!');
            console.error('[Upload Test] Error:', e.message);
            console.error('[Upload Test] Status:', e.response?.status);
            console.error('[Upload Test] Response:', JSON.stringify(e.response?.data, null, 2));
            console.error('[Upload Test] Request URL:', e.config?.url);
            console.error('[Upload Test] Request Method:', e.config?.method);
            console.error('[Upload Test] Request Headers:', JSON.stringify(e.config?.headers, null, 2));

            return NextResponse.json({
                success: false,
                results,
                message: 'Step 2 (get presigned URL) failed - this is where the 404 is happening!'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            results,
            message: 'All upload flow steps completed successfully!'
        });

    } catch (error: any) {
        console.error('[Upload Test] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
