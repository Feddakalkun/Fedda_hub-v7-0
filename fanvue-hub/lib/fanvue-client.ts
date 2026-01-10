import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';

export class FanvueClient {
    private client: AxiosInstance;

    constructor(accessToken?: string) {
        const baseURL = 'https://api.fanvue.com';

        const headers: any = {
            'Content-Type': 'application/json',
            'X-Fanvue-API-Version': '2025-06-26',
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        this.client = axios.create({
            baseURL,
            headers,
        });
    }

    /**
     * Create a client for a specific character by slug (fetches token from DB)
     */
    static async fromCharacter(slug: string): Promise<FanvueClient> {
        const character = await prisma.character.findUnique({
            where: { slug }
        });

        if (!character || !character.accessToken) {
            throw new Error(`Character '${slug}' not found or not connected to Fanvue.`);
        }

        return new FanvueClient(character.accessToken);
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        const response = await this.client.get('/users/me');
        return response.data;
    }

    /**
     * Create a new post
     */
    async createPost(data: {
        content: string;
        mediaIds?: string[];
        scheduledFor?: Date;
        price?: number;
        isSubscriberOnly?: boolean;
    }) {
        const requestBody: any = {
            text: data.content,
            mediaUuids: data.mediaIds,
            audience: data.isSubscriberOnly ? 'subscribers' : 'followers-and-subscribers',
        };

        if (data.price !== undefined && data.price > 0) {
            requestBody.price = data.price * 100;
        }

        if (data.scheduledFor) {
            requestBody.scheduledAt = data.scheduledFor.toISOString();
        }

        try {
            const response = await this.client.post('/posts', requestBody);
            return response.data;
        } catch (error: any) {
            console.error('Create Post Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Upload media file using Fanvue's official API
     */
    async uploadMedia(file: Buffer, filename: string): Promise<{ uuid: string }> {
        const sanitizedFilename = filename.split(/[/\\]/).pop()?.substring(0, 255) || 'image.png';

        try {
            // Step 1: Create multipart upload session
            const uploadSessionResponse = await this.client.post('/media/uploads', {
                name: sanitizedFilename.replace(/\.[^.]+$/, ''),
                filename: sanitizedFilename,
                mediaType: 'image',
            });

            const { mediaUuid, uploadId } = uploadSessionResponse.data;

            // Step 2: Get presigned URL for part 1
            const presignedUrlResponse = await this.client.get(`/media/uploads/${uploadId}/parts/1/url`);
            const uploadUrl = presignedUrlResponse.data;

            // Step 3: Upload to S3
            const uploadResponse = await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': 'application/octet-stream' },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            const etag = uploadResponse.headers['etag'];
            if (!etag) throw new Error('No ETag returned from S3 upload');

            // Step 4: Complete the multipart upload
            await this.client.patch(`/media/uploads/${uploadId}`, {
                parts: [{ ETag: etag, PartNumber: 1 }]
            });

            return { uuid: mediaUuid };

        } catch (error: any) {
            console.error('Upload Media Error:', error.response?.data || error.message);
            throw error;
        }
    }
}
