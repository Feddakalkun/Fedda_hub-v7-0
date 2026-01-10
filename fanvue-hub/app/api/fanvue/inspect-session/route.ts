import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

/**
 * Check what's actually in the upload session response
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

        // Create upload session with detailed logging
        console.log('[Session Inspect] Creating upload session...');
        const uploadSessionResponse = await client['client'].post('/media/uploads', {
            name: 'session_inspect',
            filename: 'session_inspect.png',
            mediaType: 'image',
        });

        const fullResponse = {
            status: uploadSessionResponse.status,
            statusText: uploadSessionResponse.statusText,
            headers: uploadSessionResponse.headers,
            data: uploadSessionResponse.data
        };

        console.log('[Session Inspect] Full response:', JSON.stringify(fullResponse, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Upload session created. Check data for presigned URLs or additional fields.',
            response: fullResponse,
            analysis: {
                hasMediaUuid: !!uploadSessionResponse.data.mediaUuid,
                hasUploadId: !!uploadSessionResponse.data.uploadId,
                hasPresignedUrl: !!uploadSessionResponse.data.uploadUrl || !!uploadSessionResponse.data.presignedUrl || !!uploadSessionResponse.data.url,
                hasParts: !!uploadSessionResponse.data.parts,
                allKeys: Object.keys(uploadSessionResponse.data)
            }
        });

    } catch (error: any) {
        console.error('[Session Inspect] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
