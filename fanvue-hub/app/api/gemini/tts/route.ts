import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voiceProvider = 'gemini', voiceModel, voiceId, voiceDescription } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Get Global Config
        const config = await prisma.appConfig.findUnique({
            where: { id: 'global' }
        });

        // =========================================================================
        // ROUTE: ELEVENLABS (High Quality)
        // =========================================================================
        if (voiceProvider === 'elevenlabs') {
            const apiKey = (config?.elevenLabsApiKey || process.env.ELEVEN_LABS_API_KEY || '').trim();

            if (!apiKey) {
                return NextResponse.json({ error: 'ElevenLabs API key not configured in Settings' }, { status: 400 });
            }

            const finalVoiceId = voiceId || voiceModel || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel

            const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!elRes.ok) {
                const err = await elRes.json();
                console.error("ElevenLabs Error:", err);
                return NextResponse.json({ error: 'ElevenLabs API Error', details: err }, { status: 500 });
            }

            // Stream audio back
            const audioBuffer = await elRes.arrayBuffer();
            return new NextResponse(audioBuffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.byteLength.toString(),
                }
            });
        }

        // =========================================================================
        // ROUTE: GEMINI (Experimental)
        // =========================================================================

        const geminiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Please add it in Settings.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        // @ts-ignore
        const { HarmCategory, HarmBlockThreshold } = await import('@google/generative-ai');

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = `Voice characteristics: ${voiceDescription || 'Balanced'}\n\nSpeak the following text:\n${text}`;

        try {
            // Attempt to use the 2.0 Flash Audio Generation capability
            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: voiceModel || "Puck"
                            }
                        }
                    }
                } as any
            });

            const response = await result.response;

            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No candidates in response');
            }

            const candidate = response.candidates[0];
            const audioPart = candidate.content.parts.find(p => p.inlineData);

            if (!audioPart || !audioPart.inlineData) {
                const textPart = candidate.content.parts.find(p => p.text);
                if (textPart) {
                    throw new Error('Model returned text instead of audio: ' + textPart.text);
                }
                throw new Error('No audio data in response');
            }

            const audioData = audioPart.inlineData.data;
            const mimeType = audioPart.inlineData.mimeType || 'audio/wav';
            const audioBuffer = Buffer.from(audioData, 'base64');

            return new NextResponse(audioBuffer, {
                headers: {
                    'Content-Type': mimeType,
                    'Content-Length': audioBuffer.length.toString(),
                }
            });

        } catch (error: any) {
            console.error('[Gemini TTS] API Error:', error);
            // If Gemini fails (e.g. 400 Bad Request regarding Modality), fallback 
            // is handled by the frontend catching this 400/500 and using Browser TTS.

            return NextResponse.json(
                { error: 'Gemini TTS Failed: ' + error.message },
                { status: 400 } // 400 triggers frontend fallback
            );
        }

    } catch (error: any) {
        console.error('[TTS] Error:', error);
        return NextResponse.json(
            {
                error: 'TTS generation failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}
