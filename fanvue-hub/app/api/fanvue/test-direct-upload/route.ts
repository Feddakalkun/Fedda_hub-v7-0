import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';
import axios from 'axios';

/**
 * Test uploading content directly to the created media record
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

        // Create upload session to get mediaUuid
        const uploadSessionResponse = await client['client'].post('/media/uploads', {
            name: 'direct_upload_test',
            filename: 'direct_upload_test.png',
            mediaType: 'image',
        });
        const { mediaUuid } = uploadSessionResponse.data;

        // Create a small test PNG
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

        // Attempt 1: PUT to /media/{mediaUuid}
        try {
            const FormDataLib = (await import('form-data')).default;
            const formData = new FormDataLib();
            formData.append('file', testImageBuffer, {
                filename: 'test.png',
                contentType: 'image/png',
            });

            const response = await axios.put(
                `https://api.fanvue.com/media/${mediaUuid}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Fanvue-API-Version': '2025-06-26',
                        ...formData.getHeaders(),
                    }
                }
            );
            results.attempts.push({
                name: 'put_with_formdata',
                endpoint: `/media/${mediaUuid}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'put_with_formdata',
                endpoint: `/media/${mediaUuid}`,
                success: false,
                error: e.message,
                status: e.response?.status,
                responseData: e.response?.data
            });
        }

        // Attempt 2: PATCH to /media/{mediaUuid}
        try {
            const FormDataLib = (await import('form-data')).default;
            const formData = new FormDataLib();
            formData.append('file', testImageBuffer, {
                filename: 'test.png',
                contentType: 'image/png',
            });

            const response = await axios.patch(
                `https://api.fanvue.com/media/${mediaUuid}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Fanvue-API-Version': '2025-06-26',
                        ...formData.getHeaders(),
                    }
                }
            );
            results.attempts.push({
                name: 'patch_with_formdata',
                endpoint: `/media/${mediaUuid}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'patch_with_formdata',
                endpoint: `/media/${mediaUuid}`,
                success: false,
                error: e.message,
                status: e.response?.status,
                responseData: e.response?.data
            });
        }

        // Attempt 3: PUT with raw buffer
        try {
            const response = await axios.put(
                `https://api.fanvue.com/media/${mediaUuid}`,
                testImageBuffer,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Fanvue-API-Version': '2025-06-26',
                        'Content-Type': 'image/png',
                    }
                }
            );
            results.attempts.push({
                name: 'put_raw_buffer',
                endpoint: `/media/${mediaUuid}`,
                success: true,
                data: response.data
            });
        } catch (e: any) {
            results.attempts.push({
                name: 'put_raw_buffer',
                endpoint: `/media/${mediaUuid}`,
                success: false,
                error: e.message,
                status: e.response?.status,
                responseData: e.response?.data
            });
        }

        const successfulAttempt = results.attempts.find((a: any) => a.success);

        return NextResponse.json({
            success: !!successfulAttempt,
            mediaUuid,
            results,
            recommendation: successfulAttempt ?
                `SUCCESS! Use: ${successfulAttempt.name} to ${successfulAttempt.endpoint}` :
                'Direct upload to created media record also failed. Fanvue API may have changed or requires different authentication/headers.'
        });

    } catch (error: any) {
        console.error('[Direct Upload Test] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
