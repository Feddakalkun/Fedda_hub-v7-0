import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Complete viral video pipeline:
 * 1. Upscale image to 4K
 * 2. Generate voice script
 * 3. Text-to-speech
 * 4. Lip-sync video
 * 5. Generate caption
 */
export async function POST(request: NextRequest) {
    try {
        const { imageUrl, characterName, scenario } = await request.json();

        if (!imageUrl || !characterName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const FAL_KEY = process.env.FAL_API_KEY;
        const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        // Step 0: Convert local image URL to base64 (Fal.ai can't access localhost)
        console.log('Step 0: Converting image to base64...');
        let imageDataUri = imageUrl;

        if (imageUrl.startsWith('/api/') || imageUrl.startsWith('http://localhost')) {
            // Fetch the image from our local server
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const fullUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : imageUrl;

            const imgRes = await fetch(fullUrl);
            const imgBuffer = await imgRes.arrayBuffer();
            const imgBase64 = Buffer.from(imgBuffer).toString('base64');
            const contentType = imgRes.headers.get('content-type') || 'image/png';
            imageDataUri = `data:${contentType};base64,${imgBase64}`;
        }

        // Step 1: Upscale image to 4K
        console.log('Step 1: Upscaling image...');
        const upscaleRes = await fetch('https://fal.run/fal-ai/clarity-upscaler', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageDataUri,
                scale: 2,
            }),
        });
        const upscaleData = await upscaleRes.json();
        const upscaledImageUrl = upscaleData.image?.url;

        // Step 2: Generate voice script using Gemini directly
        console.log('Step 2: Generating voice script...');
        const genAI = new GoogleGenerativeAI(GEMINI_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const scriptPrompt = `You are ${characterName}, a flirty AI influencer. Write a short 15-20 second voice message for this scenario: ${scenario}.

Rules:
- First person perspective
- Flirty and engaging tone
- Natural, conversational
- 2-3 sentences max
- End with a teasing question or call-to-action

Return ONLY the script, nothing else.`;

        const scriptResult = await model.generateContent(scriptPrompt);
        const script = scriptResult.response.text().trim();

        // Step 3: Generate voice using ElevenLabs
        console.log('Step 3: Generating voice...');
        const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: script,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });
        const audioBuffer = await voiceRes.arrayBuffer();

        // Convert to base64 for Fal.ai
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;

        // Step 4: Create lip-sync video
        console.log('Step 4: Creating lip-sync video...');
        const lipsyncRes = await fetch('https://fal.run/fal-ai/sync-lipsync-2-pro', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url: upscaledImageUrl,
                audio_url: audioDataUri,
            }),
        });
        const lipsyncData = await lipsyncRes.json();
        const videoUrl = lipsyncData.video?.url;

        // Step 5: Generate viral caption using Gemini directly
        console.log('Step 5: Generating caption...');
        const captionPrompt = `You are a social media expert for adult content creators on Fanvue.
Generate an engaging caption for this scenario: ${scenario}

Tone: flirty, playful, suggestive
Rules:
- Keep it under 150 characters
- Include 1-3 relevant emojis
- End with a call-to-action or question
- Be authentic, not cringe
- Hint at exclusivity

Return ONLY the caption, nothing else.`;

        const captionResult = await model.generateContent(captionPrompt);
        const caption = captionResult.response.text().trim();

        return NextResponse.json({
            success: true,
            video: {
                url: videoUrl,
                upscaledImage: upscaledImageUrl,
                audio: audioDataUri,
                script,
                caption,
            },
        });

    } catch (error: any) {
        console.error('Pipeline error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Pipeline failed',
        }, { status: 500 });
    }
}
