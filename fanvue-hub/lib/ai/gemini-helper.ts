import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function ensureConfigured() {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

export class GeminiHelper {
    /**
     * Enhance a basic prompt into a viral-worthy, ultra-detailed prompt
     */
    async enhancePrompt(basicPrompt: string, style: 'influencer' | 'cinematic' | 'raw' = 'influencer'): Promise<string> {
        const ai = ensureConfigured();
        if (!ai) throw new Error('Gemini API not configured');

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = `You are an expert at creating viral AI influencer images. 
Your task is to enhance basic prompts into ultra-detailed, realistic prompts that generate stunning, Instagram-worthy images.

Style guidelines:
- influencer: iPhone aesthetic, candid, natural lighting, relatable
- cinematic: dramatic lighting, movie-quality, artistic
- raw: hyperrealistic, skin texture, natural imperfections

Rules:
1. Always include specific physical details (ethnicity, age, body type, hair, eyes, skin)
2. Describe clothing in detail
3. Specify exact action/pose
4. Define lighting and camera
5. Add realistic imperfections for authenticity
6. Keep it under 200 words
7. NO generic descriptions - be SPECIFIC

Return ONLY the enhanced prompt, nothing else.`;

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Style: ${style}\n\nBasic prompt: ${basicPrompt}\n\nEnhanced prompt:` }
        ]);

        return result.response.text().trim();
    }

    /**
     * Generate a viral caption for a Fanvue post
     */
    async generateCaption(imageDescription: string, tone: 'flirty' | 'casual' | 'mysterious' = 'casual'): Promise<string> {
        const ai = ensureConfigured();
        if (!ai) throw new Error('Gemini API not configured');

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = `You are a social media expert for adult content creators on Fanvue.
Generate engaging captions that drive engagement and subscriptions.

Tone guidelines:
- flirty: playful, suggestive, emoji-heavy
- casual: relatable, authentic, conversational
- mysterious: teasing, curiosity-building, exclusive

Rules:
1. Keep it under 150 characters
2. Include 1-3 relevant emojis
3. End with a call-to-action or question
4. Be authentic, not cringe
5. Hint at exclusivity without being explicit

Return ONLY the caption, nothing else.`;

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Tone: ${tone}\n\nImage: ${imageDescription}\n\nCaption:` }
        ]);

        return result.response.text().trim();
    }

    /**
     * Generate multiple viral scenario prompts
     */
    async generateScenarios(characterDescription: string, count: number = 5): Promise<string[]> {
        const ai = ensureConfigured();
        if (!ai) throw new Error('Gemini API not configured');

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = `You are an expert at creating viral influencer content scenarios.
Generate diverse, engaging scenarios for a character that will perform well on Fanvue and Instagram.

Character: ${characterDescription}

Generate ${count} different scenarios. Each should be:
1. Unique and visually interesting
2. Relatable or aspirational
3. Instagram/Fanvue-friendly
4. Include outfit, action, and location

Format: One scenario per line, no numbering.`;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text().trim();

        return text.split('\n').filter(line => line.trim().length > 0).slice(0, count);
    }

    /**
     * Analyze a prompt and suggest improvements
     */
    async analyzePrompt(prompt: string): Promise<{
        score: number;
        suggestions: string[];
        improved: string;
    }> {
        const ai = ensureConfigured();
        if (!ai) throw new Error('Gemini API not configured');

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = `Analyze this image generation prompt and provide:
1. A score (0-100) for viral potential
2. 3 specific suggestions for improvement
3. An improved version of the prompt

Format your response as JSON:
{
  "score": 85,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improved": "improved prompt here"
}`;

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Prompt to analyze: ${prompt}` }
        ]);

        const text = result.response.text().trim();
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }

        throw new Error('Failed to parse Gemini response');
    }
}

export const geminiHelper = new GeminiHelper();
