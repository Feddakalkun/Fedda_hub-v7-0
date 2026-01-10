import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('fanvue_access_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Not connected to Fanvue' }, { status: 401 });
        }

        const body = await request.json();
        const { message, filename, price, excludeNames } = body;

        if (!message && !filename) {
            return NextResponse.json({ success: false, error: 'Message or Image required' }, { status: 400 });
        }

        const client = new FanvueClient(token);

        // 1. Upload Media (if present)
        let mediaId: string | undefined;
        if (filename) {
            try {
                const filePath = join(process.cwd(), 'public', 'generated', filename);
                const fileBuffer = await readFile(filePath);
                const media = await client.uploadMedia(fileBuffer, filename);
                mediaId = media.id || media.mediaId;
            } catch (error: any) {
                console.error('Media upload failed:', error);
                return NextResponse.json({ success: false, error: 'Failed to upload media associated with DM' }, { status: 500 });
            }
        }

        // 2. Fetch Subscribers
        // For V1, we fetch the first 100. In real prod, we'd paginate till end.
        let subscribers = [];
        try {
            const result = await client.getSubscribers(100, 0);
            subscribers = result.subscribers || [];
        } catch (error: any) {
            console.warn('Failed to fetch subscribers, using mock data for dev mode if needed or falling back:', error.message);
            // Fallback for dev/testing if API fails (common in sandbox)
            // subscribers = [{ id: 'mock_user_1', displayName: 'TestUser' }];
            return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 });
        }

        if (subscribers.length === 0) {
            return NextResponse.json({ success: false, message: 'No subscribers found to message.' });
        }

        // 3. Blast Messages
        const results = {
            successful: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Process in serial to avoid rate limits (safe mode)
        for (const sub of subscribers) {
            if (excludeNames && excludeNames.includes(sub.displayName)) continue;

            try {
                // Determine user ID - API might return 'id' or 'userId'
                const userId = sub.id || sub.userId;

                await client.sendMessage(
                    userId,
                    message || '', // Content
                    mediaId ? [mediaId] : undefined, // Media
                    price ? Number(price) : undefined // Price (PPV)
                );

                results.successful++;

                // Tiny delay to be nice to API
                await new Promise(r => setTimeout(r, 500));

            } catch (error: any) {
                console.error(`Failed to msg ${sub.displayName}:`, error.message);
                results.failed++;
                results.errors.push(`${sub.displayName}: ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            results,
            message: `Sent to ${results.successful} subscribers. Failed: ${results.failed}`
        });

    } catch (error: any) {
        console.error('Mass DM Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
