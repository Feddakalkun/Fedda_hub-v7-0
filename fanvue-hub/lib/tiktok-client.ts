import { prisma } from '@/lib/prisma';

export class TikTokClient {
    private clientKey: string;
    private clientSecret: string;

    constructor() {
        this.clientKey = process.env.TIKTOK_CLIENT_KEY || '';
        this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    }

    async getConnection(characterSlug: string) {
        const character = await prisma.character.findUnique({
            where: { slug: characterSlug },
            include: { tiktokConnection: true }
        });
        return character?.tiktokConnection;
    }

    async getValidAccessToken(connectionId: string): Promise<string> {
        const connection = await prisma.tikTokConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error('TikTok connection not found');
        }

        // Check if token is expired (buffer 5 mins)
        if (new Date(Date.now() + 5 * 60000) >= connection.expiresAt) {
            return this.refreshAccessToken(connectionId);
        }

        return connection.accessToken;
    }

    async refreshAccessToken(connectionId: string): Promise<string> {
        const connection = await prisma.tikTokConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error('TikTok connection not found');
        }

        const response = await fetch('https://open.tiktok.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_key: this.clientKey,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: connection.refreshToken
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Token refresh failed: ${data.error_description || JSON.stringify(data)}`);
        }

        const { access_token, refresh_token, expires_in } = data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Update database
        await prisma.tikTokConnection.update({
            where: { id: connectionId },
            data: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in,
                expiresAt,
                lastTokenRefresh: new Date()
            }
        });

        return access_token;
    }

    async postImage(
        connectionId: string,
        imageUrl: string,
        caption: string,
        hashtags: string = ''
    ): Promise<{ videoId: string; shareUrl: string }> {
        const accessToken = await this.getValidAccessToken(connectionId);

        // Step 1: Request upload parameters
        // Note: 'https://open.tiktok.com/v1/post/publish/inbox/video/init' is used for direct posting in some integrations
        // For images (Photo Mode), the endpoint might differ or use the same init. 
        // We strictly follow the provided guide.

        // Ensure URL is accessible (if local, might need ngrok or just passing the proxied URL might fail if TikTok can't reach it)
        // The guide says "source: 'PULL_FROM_URL'". This requires the URL to be public using internet.
        // If we are on localhost, this will FAIL.
        // However, the user might be using a tunnel or just testing logic. I will implement as requested.

        const uploadInitResponse = await fetch(
            `https://open.tiktok.com/v1/post/publish/inbox/video/init`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source_info: {
                        source: 'PULL_FROM_URL',
                        video_url: imageUrl
                    }
                })
            }
        );

        const uploadInit = await uploadInitResponse.json();

        if (uploadInit.error) {
            throw new Error(`Upload init failed: ${uploadInit.error.message}`);
        }

        const { publish_id } = uploadInit.data;

        // Step 2: Publish the post
        const fullCaption = caption + (hashtags ? ` ${hashtags}` : '');

        const publishResponse = await fetch(
            `https://open.tiktok.com/v1/post/publish/action/publish`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    media_type: 'PHOTO',
                    publish_id,
                    post_info: {
                        caption: fullCaption.slice(0, 2200),
                        privacy_level: 'PUBLIC',
                        disable_comment: false,
                        disable_duet: false,
                        disable_stitch: false
                    }
                })
            }
        );

        const publishData = await publishResponse.json();

        if (publishData.error) {
            throw new Error(`Publish failed: ${publishData.error.message}`);
        }

        const videoId = publishData.data?.video_id;
        const shareUrl = publishData.data?.share_url;

        if (!videoId) {
            throw new Error('No video ID returned from TikTok');
        }

        // Update stats
        await prisma.tikTokConnection.update({
            where: { id: connectionId },
            data: {
                totalPostsVia: { increment: 1 },
                lastPostedAt: new Date()
            }
        });

        return { videoId, shareUrl };
    }
}

export const tikTokClient = new TikTokClient();
