import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

/**
 * Test query parameter-based endpoints
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

        // Create upload session
        const uploadSessionResponse = await client['client'].post('/media/uploads', {
            name: 'query_param_test',
            filename: 'query_param_test.png',
            mediaType: 'image',
        });
        const { mediaUuid, uploadId } = uploadSessionResponse.data;

        const partNumber = 1;

        // Attempt 1: Query params with uploadId
        try {
            const response = await client['client'].get(`/media/uploads?uploadId=${uploadId}&part=${partNumber}`);
            results.attempts.push({
                name: 'query_uploadId',
                endpoint: `/media/uploads?uploadId=${uploadId.substring(0, 30)}...&part=${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'query_uploadId',
                endpoint: `/media/uploads?uploadId=...&part=${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 2: Query params with mediaUuid
        try {
            const response = await client['client'].get(`/media/uploads?mediaUuid=${mediaUuid}&part=${partNumber}`);
            results.attempts.push({
                name: 'query_mediaUuid',
                endpoint: `/media/uploads?mediaUuid=${mediaUuid}&part=${partNumber}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'query_mediaUuid',
                endpoint: `/media/uploads?mediaUuid=${mediaUuid}&part=${partNumber}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 3: Just get the media by UUID (might return upload info)
        try {
            const response = await client['client'].get(`/media/${mediaUuid}`);
            results.attempts.push({
                name: 'get_media_by_uuid',
                endpoint: `/media/${mediaUuid}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'get_media_by_uuid',
                endpoint: `/media/${mediaUuid}`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 4: List all uploads (might show correct structure)
        try {
            const response = await client['client'].get('/media/uploads');
            results.attempts.push({
                name: 'list_uploads',
                endpoint: '/media/uploads',
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'list_uploads',
                endpoint: '/media/uploads',
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
                `Successful endpoint: ${successfulAttempt.name}` :
                'Query parameter approach also failed.'
        });

    } catch (error: any) {
        console.error('[Query Param Test] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
