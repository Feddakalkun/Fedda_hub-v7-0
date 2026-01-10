import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

/**
 * Test different endpoint variations for getting presigned URLs
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
        const results: any = { attempts: [] };

        // Step 1: Create upload session
        console.log('[Endpoint Test] Creating upload session...');
        const uploadSessionResponse = await client['client'].post('/media/uploads', {
            name: 'endpoint_test',
            filename: 'endpoint_test.png',
            mediaType: 'image',
        });
        const { mediaUuid, uploadId } = uploadSessionResponse.data;
        console.log('[Endpoint Test] mediaUuid:', mediaUuid);
        console.log('[Endpoint Test] uploadId:', uploadId);

        const partNumber = 1;

        // Attempt 1: Try with full uploadId
        try {
            console.log('[Endpoint Test] Attempt 1: /media/uploads/${uploadId}/parts/${partNumber}');
            const response = await client['client'].get(`/media/uploads/${uploadId}/parts/${partNumber}`);
            results.attempts.push({
                name: 'full_upload_id',
                endpoint: `/media/uploads/${uploadId}/parts/${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'full_upload_id',
                endpoint: `/media/uploads/${uploadId}/parts/${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 2: Try with mediaUuid instead
        try {
            console.log('[Endpoint Test] Attempt 2: /media/uploads/${mediaUuid}/parts/${partNumber}');
            const response = await client['client'].get(`/media/uploads/${mediaUuid}/parts/${partNumber}`);
            results.attempts.push({
                name: 'media_uuid',
                endpoint: `/media/uploads/${mediaUuid}/parts/${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'media_uuid',
                endpoint: `/media/uploads/${mediaUuid}/parts/${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 3: Try /media/${mediaUuid}/upload/parts/${partNumber}
        try {
            console.log('[Endpoint Test] Attempt 3: /media/${mediaUuid}/upload/parts/${partNumber}');
            const response = await client['client'].get(`/media/${mediaUuid}/upload/parts/${partNumber}`);
            results.attempts.push({
                name: 'media_uuid_alt_path',
                endpoint: `/media/${mediaUuid}/upload/parts/${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'media_uuid_alt_path',
                endpoint: `/media/${mediaUuid}/upload/parts/${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 4: Try /media/${mediaUuid}/parts/${partNumber}
        try {
            console.log('[Endpoint Test] Attempt 4: /media/${mediaUuid}/parts/${partNumber}');
            const response = await client['client'].get(`/media/${mediaUuid}/parts/${partNumber}`);
            results.attempts.push({
                name: 'media_short_path',
                endpoint: `/media/${mediaUuid}/parts/${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'media_short_path',
                endpoint: `/media/${mediaUuid}/parts/${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 5: Try with URL-encoded uploadId
        try {
            const encodedUploadId = encodeURIComponent(uploadId);
            console.log('[Endpoint Test] Attempt 5: /media/uploads/${encodedUploadId}/parts/${partNumber}');
            const response = await client['client'].get(`/media/uploads/${encodedUploadId}/parts/${partNumber}`);
            results.attempts.push({
                name: 'encoded_upload_id',
                endpoint: `/media/uploads/${encodedUploadId}/parts/${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'encoded_upload_id',
                endpoint: `/media/uploads/[ENCODED]/parts/${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        const successfulAttempt = results.attempts.find((a: any) => a.success);

        return NextResponse.json({
            success: !!successfulAttempt,
            uploadSession: { mediaUuid, uploadId: uploadId.substring(0, 50) + '...' },
            results,
            recommendation: successfulAttempt ?
                `Use endpoint: ${successfulAttempt.endpoint.replace(mediaUuid, '{mediaUuid}').replace(uploadId, '{uploadId}')}` :
                'None of the endpoint variations worked. Need to contact Fanvue support for correct endpoint structure.'
        });

    } catch (error: any) {
        console.error('[Endpoint Test] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
