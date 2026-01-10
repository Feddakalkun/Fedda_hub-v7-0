import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';
import axios from 'axios';

/**
 * Test if maybe we can upload directly without presigned URLs
 * or if POST is needed instead of GET
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
            name: 'alternative_flow',
            filename: 'alternative_flow.png',
            mediaType: 'image',
        });
        const { mediaUuid, uploadId } = uploadSessionResponse.data;

        // Create a small test image buffer
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

        // Attempt 1: POST to get presigned URL
        try {
            const response = await client['client'].post(`/media/uploads/${uploadId}/parts`, {
                partNumber: 1
            });
            results.attempts.push({
                name: 'post_for_presigned_url',
                method: 'POST',
                endpoint: `/media/uploads/${uploadId}/parts`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'post_for_presigned_url',
                method: 'POST',
                endpoint: `/media/uploads/${uploadId}/parts`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 2: POST with mediaUuid
        try {
            const response = await client['client'].post(`/media/uploads/${mediaUuid}/parts`, {
                partNumber: 1
            });
            results.attempts.push({
                name: 'post_media_uuid_parts',
                method: 'POST',
                endpoint: `/media/uploads/${mediaUuid}/parts`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'post_media_uuid_parts',
                method: 'POST',
                endpoint: `/media/uploads/${mediaUuid}/parts`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 3: Try uploading directly to /media/{mediaUuid}/content or similar  
        try {
            const response = await axios.put(`https://api.fanvue.com/media/${mediaUuid}/content`, testImageBuffer, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'image/png',
                    'X-Fanvue-API-Version': '2025-06-26',
                }
            });
            results.attempts.push({
                name: 'direct_upload_to_media_content',
                method: 'PUT',
                endpoint: `/media/${mediaUuid}/content`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'direct_upload_to_media_content',
                method: 'PUT',
                endpoint: `/media/${mediaUuid}/content`,
                success: false,
                error: e.message,
                status: e.response?.status
            });
        }

        // Attempt 4: Complete upload without actual file upload (test if this triggers anything)
        try {
            const response = await client['client'].post(`/media/uploads/${uploadId}/complete`, {
                parts: []
            });
            results.attempts.push({
                name: 'complete_without_parts',
                method: 'POST',
                endpoint: `/media/uploads/${uploadId}/complete`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'complete_without_parts',
                method: 'POST',
                endpoint: `/media/uploads/${uploadId}/complete`,
                success: false,
                error: e.message,
                status: e.response?.status,
                responseData: e.response?.data
            });
        }

        const successfulAttempt = results.attempts.find((a: any) => a.success);

        return NextResponse.json({
            success: !!successfulAttempt,
            uploadSession: { mediaUuid, uploadId: uploadId.substring(0, 50) + '...' },
            results,
            recommendation: successfulAttempt ?
                `Successful approach: ${successfulAttempt.name}` :
                'Alternative flow approaches also failed.'
        });

    } catch (error: any) {
        console.error('[Alternative Flow Test] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
