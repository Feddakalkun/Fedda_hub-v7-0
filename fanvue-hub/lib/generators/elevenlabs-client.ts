import axios from 'axios';

export class ElevenLabsClient {
    private apiKey: string;
    private baseURL = 'https://api.elevenlabs.io/v1';

    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    }

    /**
     * Generate voice/speech from text
     */
    async generateVoice(params: {
        text: string;
        voiceId: string;
        stability?: number;
        similarityBoost?: number;
        style?: number;
        useSpeakerBoost?: boolean;
    }): Promise<Buffer> {
        const {
            text,
            voiceId,
            stability = 0.5,
            similarityBoost = 0.75,
            style = 0.35,
            useSpeakerBoost = true,
        } = params;

        const response = await axios.post(
            `${this.baseURL}/text-to-speech/${voiceId}`,
            {
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability,
                    similarity_boost: similarityBoost,
                    style,
                    use_speaker_boost: useSpeakerBoost,
                },
            },
            {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            }
        );

        return Buffer.from(response.data);
    }

    /**
     * Generate voice using Emily's normal voice
     */
    async generateEmilyVoice(text: string, options?: {
        stability?: number;
        similarity?: number;
        style?: number;
    }): Promise<Buffer> {
        const EMILY_VOICE_ID = 'odyUrTN5HMVKujvVAgWW';

        return this.generateVoice({
            text,
            voiceId: EMILY_VOICE_ID,
            stability: options?.stability || 0.55,
            similarityBoost: options?.similarity || 0.75,
            style: options?.style || 0.35,
        });
    }

    /**
     * Generate voice using Emily's whisper voice
     */
    async generateEmilyWhisper(text: string, options?: {
        stability?: number;
        similarity?: number;
        style?: number;
    }): Promise<Buffer> {
        const EMILY_WHISPER_VOICE_ID = '1cxc5c3E9K6F1wlqOJGV';

        return this.generateVoice({
            text,
            voiceId: EMILY_WHISPER_VOICE_ID,
            stability: options?.stability || 0.55,
            similarityBoost: options?.similarity || 0.75,
            style: options?.style || 0.35,
        });
    }

    /**
     * Get available voices
     */
    async getVoices() {
        const response = await axios.get(`${this.baseURL}/voices`, {
            headers: {
                'xi-api-key': this.apiKey,
            },
        });
        return response.data;
    }

    /**
     * Get voice details
     */
    async getVoice(voiceId: string) {
        const response = await axios.get(`${this.baseURL}/voices/${voiceId}`, {
            headers: {
                'xi-api-key': this.apiKey,
            },
        });
        return response.data;
    }
}

export const elevenLabsClient = new ElevenLabsClient();
