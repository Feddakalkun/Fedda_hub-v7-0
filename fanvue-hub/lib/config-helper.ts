import { prisma } from '@/lib/prisma';

export async function getAppConfig() {
    try {
        const config = await prisma.appConfig.findUnique({
            where: { id: 'global' }
        });

        return {
            comfyuiUrl: config?.comfyuiUrl || process.env.COMFYUI_URL || 'http://127.0.0.1:8188',
            geminiApiKey: config?.geminiApiKey || process.env.GEMINI_API_KEY,
            falApiKey: config?.falApiKey || process.env.FAL_API_KEY,
            elevenLabsApiKey: config?.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY,
            clientId: config?.clientId || process.env.OAUTH_CLIENT_ID,
            clientSecret: config?.clientSecret || process.env.OAUTH_CLIENT_SECRET,
        };
    } catch (error) {
        console.error('Failed to fetch AppConfig:', error);
        // Fallback to env or defaults
        return {
            comfyuiUrl: process.env.COMFYUI_URL || 'http://127.0.0.1:8188',
            geminiApiKey: process.env.GEMINI_API_KEY,
            falApiKey: process.env.FAL_API_KEY,
            elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
        };
    }
}
