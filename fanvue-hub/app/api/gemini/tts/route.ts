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
        // ROUTE: UBERDUCK (Cost-effective high quality)
        // =========================================================================
        if (voiceProvider === 'uberduck') {
            const apiKey = (config?.uberduckApiKey || process.env.UBERDUCK_API_KEY || '').trim();
            const apiSecret = (config?.uberduckApiSecret || process.env.UBERDUCK_API_SECRET || '').trim();

            if (!apiKey || !apiSecret) {
                return NextResponse.json({ error: 'Uberduck API credentials not configured' }, { status: 400 });
            }

            const voiceModelId = voiceModel || 'voice_en_female_03'; // Default sultry female
            const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

            // Step 1: Initiate TTS job
            const uberduckRes = await fetch('https://api.uberduck.ai/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify({
                    speech: text,
                    voicemodel_uuid: voiceModelId,
                    pitch: 1.0,
                    speed: 1.0,
                    temperature: 0.5
                })
            });

            if (!uberduckRes.ok) {
                const err = await uberduckRes.json();
                console.error("Uberduck Error:", err);
                return NextResponse.json({ error: 'Uberduck API Error', details: err }, { status: 500 });
            }

            const jobData = await uberduckRes.json();
            const jobId = jobData.uuid;

            // Step 2: Poll for completion (max 30 seconds)
            let attempts = 0;
            let audioUrl = null;

            while (attempts < 30 && !audioUrl) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                const statusRes = await fetch(`https://api.uberduck.ai/speak-status?uuid=${jobId}`, {
                    headers: { 'Authorization': authHeader }
                });

                const statusData = await statusRes.json();

                if (statusData.path) {
                    audioUrl = statusData.path;
                    break;
                }

                if (statusData.failed_at) {
                    return NextResponse.json({ error: 'Uberduck job failed' }, { status: 500 });
                }

                attempts++;
            }

            if (!audioUrl) {
                return NextResponse.json({ error: 'Uberduck timeout - job took too long' }, { status: 504 });
            }

            // Step 3: Fetch the audio and return
            const audioRes = await fetch(audioUrl);
            const audioBuffer = await audioRes.arrayBuffer();

            return new NextResponse(audioBuffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.byteLength.toString()
                }
            });
        }

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
        // ROUTE: AZURE (5M chars/month FREE - Neural Voices)
        // Best Female Voices: Eva, Aria, Jenny
        // =========================================================================
        if (voiceProvider === 'azure') {
            const apiKey = process.env.AZURE_SPEECH_KEY;
            const region = process.env.AZURE_SPEECH_REGION || 'eastus';

            if (!apiKey) {
                return NextResponse.json({ error: 'Azure Speech API key not configured' }, { status: 400 });
            }

            const voiceName = voiceModel || 'en-US-AriaNeural'; // Default: Aria (natural female)

            const azureRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                },
                body: `<speak version='1.0' xml:lang='en-US'>
                    <voice name='${voiceName}'>${text}</voice>
                </speak>`
            });

            if (!azureRes.ok) {
                const err = await azureRes.text();
                console.error("Azure TTS Error:", err);
                return NextResponse.json({ error: 'Azure TTS Error', details: err }, { status: 500 });
            }

            const audioBuffer = await azureRes.arrayBuffer();
            return new NextResponse(audioBuffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.byteLength.toString(),
                }
            });
        }

        // =========================================================================
        // ROUTE: GOOGLE CLOUD (1M chars/month FREE - WaveNet)
        // Best Female Voice: en-US-Wavenet-F (natural, warm)
        // =========================================================================
        if (voiceProvider === 'google') {
            const apiKey = process.env.GOOGLE_CLOUD_TTS_KEY;

            if (!apiKey) {
                return NextResponse.json({ error: 'Google Cloud TTS API key not configured' }, { status: 400 });
            }

            const voiceName = voiceModel || 'en-US-Wavenet-F'; // Default: Wavenet-F female

            const googleRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: 'en-US',
                        name: voiceName
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 1.0,
                        pitch: 0.0
                    }
                })
            });

            if (!googleRes.ok) {
                const err = await googleRes.json();
                console.error("Google Cloud TTS Error:", err);
                return NextResponse.json({ error: 'Google TTS Error', details: err }, { status: 500 });
            }

            const data = await googleRes.json();
            const audioBuffer = Buffer.from(data.audioContent, 'base64');

            return new NextResponse(audioBuffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.length.toString(),
                }
            });
        }

        // =========================================================================
        // ROUTE: AWS POLLY (5M chars/month FREE - Neural)
        // Best Female Voices: Joanna, Ivy, Kendra
        // =========================================================================
        if (voiceProvider === 'polly') {
            const region = process.env.AWS_REGION || 'us-east-1';
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

            if (!accessKeyId || !secretAccessKey) {
                return NextResponse.json({ error: 'AWS Polly credentials not configured' }, { status: 400 });
            }

            const voiceName = voiceModel || 'Joanna'; // Default: Joanna (professional female)

            // AWS Signature V4 signing (simplified for TTS)
            const { PollyClient, SynthesizeSpeechCommand } = await import('@aws-sdk/client-polly');

            const pollyClient = new PollyClient({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey
                }
            });

            const command = new SynthesizeSpeechCommand({
                Text: text,
                OutputFormat: 'mp3',
                VoiceId: voiceName,
                Engine: 'neural' // Use neural engine for best quality
            });

            try {
                const response = await pollyClient.send(command);
                const audioBuffer = await response.AudioStream?.transformToByteArray();

                if (!audioBuffer) {
                    throw new Error('No audio returned from Polly');
                }

                return new NextResponse(audioBuffer, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': audioBuffer.length.toString(),
                    }
                });
            } catch (err: any) {
                console.error("AWS Polly Error:", err);
                return NextResponse.json({ error: 'Polly TTS Error', details: err.message }, { status: 500 });
            }
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
