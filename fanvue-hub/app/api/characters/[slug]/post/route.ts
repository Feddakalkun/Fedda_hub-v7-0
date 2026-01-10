import { NextRequest, NextResponse } from 'next/server';
import { FanvueClient } from '@/lib/fanvue-client';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { imageUrl, caption, isSubscriberOnly, price } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ success: false, error: 'imageUrl is required' }, { status: 400 });
        }

        // Get authenticated client
        const client = await FanvueClient.fromCharacter(slug);

        // Fetch image data
        // We expect imageUrl to be relative (/api/comfyui/view...) or absolute
        const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`;
        const imageRes = await fetch(absoluteUrl);
        if (!imageRes.ok) {
            throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
        }
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

        // Extract filename for Fanvue
        const urlObj = new URL(absoluteUrl);
        const filename = urlObj.searchParams.get('filename') || 'image.png';

        // 1. Upload to Fanvue
        const media = await client.uploadMedia(imageBuffer, filename);
        if (!media.uuid) {
            throw new Error('Upload failed: no UUID returned');
        }

        // 2. Create Post
        const post = await client.createPost({
            content: caption || '',
            mediaIds: [media.uuid],
            isSubscriberOnly: isSubscriberOnly || false,
            price: price || 0
        });

        return NextResponse.json({ success: true, post });

    } catch (error: any) {
        console.error('[Fanvue Post Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
