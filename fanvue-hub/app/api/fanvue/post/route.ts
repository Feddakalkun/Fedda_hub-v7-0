import { NextRequest, NextResponse } from 'next/server';
import { getFanvueClient, detectPersona } from '@/lib/get-fanvue-client';

export async function POST(request: NextRequest) {
    try {
        // Detect which persona this request is for (Emily or Thale)
        const persona = detectPersona(request);
        console.log('[Fanvue Post] Detected persona:', persona || 'none (using OAuth fallback)');

        // Get client with persona-specific cookies or OAuth fallback
        let client;
        try {
            client = await getFanvueClient({ persona, preferCookies: true });
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                error: 'Not connected to Fanvue. Please connect first or ensure cookie files exist.'
            }, { status: 401 });
        }

        const body = await request.json();
        const { imageUrl, filename: directFilename, caption, isSubscriberOnly, price } = body;

        // Extract params from imageUrl or use direct filename
        let filename = directFilename || '';
        let subfolder = '';
        let type = 'output';

        if (imageUrl && imageUrl.includes('?')) {
            const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
            filename = urlParams.get('filename') || filename;
            subfolder = urlParams.get('subfolder') || '';
            type = urlParams.get('type') || 'output';
        }

        if (!filename) {
            return NextResponse.json({ success: false, error: 'Filename or imageUrl is required' }, { status: 400 });
        }

        console.log('[Fanvue Post] Starting upload for:', { filename, subfolder, type });

        // Fetch image from ComfyUI (images are stored there, not in public/generated)
        const comfyUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
        const viewUrl = `${comfyUrl}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`;
        console.log('[Fanvue Post] Fetching from:', viewUrl);

        let imageResponse = await fetch(viewUrl);
        let imageBuffer: Buffer;

        // If ComfyUI fetch fails, try fetching from local public/generated folder
        if (!imageResponse.ok) {
            console.warn('[Fanvue Post] ComfyUI fetch failed (${imageResponse.status}), trying local fallback...');

            // Try to construct local path from filename
            // Filename format is typically: Emily/mood/date/title_timestamp.png or 0_00092_.png
            const localImageUrl = `http://localhost:${process.env.PORT || 3000}/generated/${filename}`;
            console.log('[Fanvue Post] Trying local fallback:', localImageUrl);

            const localResponse = await fetch(localImageUrl);

            if (!localResponse.ok) {
                console.error('[Fanvue Post] Both ComfyUI and local fetch failed');
                console.error('[Fanvue Post] ComfyUI URL:', viewUrl, '| Status:', imageResponse.status);
                console.error('[Fanvue Post] Local URL:', localImageUrl, '| Status:', localResponse.status);
                return NextResponse.json({
                    success: false,
                    error: `Failed to fetch image from both ComfyUI (${imageResponse.status}) and local (${localResponse.status})`
                }, { status: 404 });
            }

            imageBuffer = Buffer.from(await localResponse.arrayBuffer());
            console.log('[Fanvue Post] ✅ Fetched from LOCAL fallback, size:', imageBuffer.length, 'bytes');
        } else {
            imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            console.log('[Fanvue Post] ✅ Fetched from ComfyUI, size:', imageBuffer.length, 'bytes');
        }

        // Client already created above via getFanvueClient

        // 1. Upload Media to Fanvue
        let media;
        try {
            console.log('[Fanvue Post] Calling uploadMedia with filename:', filename);
            media = await client.uploadMedia(imageBuffer, filename);
            console.log('[Fanvue Post] Media uploaded successfully!');
            console.log('[Fanvue Post] Media object:', JSON.stringify(media, null, 2));
        } catch (e: any) {
            console.error('[Fanvue Post] ❌ Upload failed - Full error:', e);
            console.error('[Fanvue Post] ❌ Upload failed - Message:', e.message);
            console.error('[Fanvue Post] ❌ Upload failed - Stack:', e.stack);
            if (e.response) {
                console.error('[Fanvue Post] ❌ Error response status:', e.response.status);
                console.error('[Fanvue Post] ❌ Error response data:', JSON.stringify(e.response.data, null, 2));
            }
            return NextResponse.json({ success: false, error: `Failed to upload media: ${e.message}` }, { status: 500 });
        }

        // 2. Create Post on Fanvue
        let post;
        try {
            const mediaId = media?.uuid; // uploadMedia returns { uuid: mediaUuid }

            if (!mediaId) {
                console.error('[Fanvue Post] No media ID returned:', media);
                throw new Error('No media ID returned from upload');
            }

            post = await client.createPost({
                content: caption || '',
                mediaIds: [mediaId],
                isSubscriberOnly: isSubscriberOnly ?? false,
                price: price,
            });
            console.log('[Fanvue Post] Post created:', post);
        } catch (e: any) {
            console.error('[Fanvue Post] Post creation failed:', e);
            return NextResponse.json({ success: false, error: `Failed to create post: ${e.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, post });
    } catch (error: any) {
        console.error('[Fanvue Post] Unexpected error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
