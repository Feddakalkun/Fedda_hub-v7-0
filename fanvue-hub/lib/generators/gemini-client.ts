import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiClient {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    /**
     * Generate a caption for an image based on character personality
     */
    async generateCaption(params: {
        imageDescription?: string;
        characterPersonality: string;
        postType?: string;
        tone?: string;
    }): Promise<string> {
        const { imageDescription, characterPersonality, postType = 'general', tone = 'friendly' } = params;

        const prompt = `You are generating a social media caption for a content creator with the following personality:

${characterPersonality}

${imageDescription ? `The image shows: ${imageDescription}` : ''}

Post type: ${postType}
Tone: ${tone}

Generate an engaging, authentic caption that matches this creator's personality. Keep it concise (1-3 sentences) and engaging. Include relevant emojis naturally. Do not use hashtags.

Caption:`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Generate a personalized message based on subscriber context
     */
    async generateMessage(params: {
        characterPersonality: string;
        context: string;
        messageType: 'welcome' | 'thank_you' | 'custom';
        subscriberName?: string;
    }): Promise<string> {
        const { characterPersonality, context, messageType, subscriberName } = params;

        const prompt = `You are ${characterPersonality}

Generate a ${messageType} message for a subscriber${subscriberName ? ' named ' + subscriberName : ''}.

Context: ${context}

The message should be:
- Personal and warm
- Brief (2-4 sentences)
- Authentic to the character's personality
- Include appropriate emojis

Message:`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Improve/enhance an image generation prompt
     */
    async improvePrompt(params: {
        basePrompt: string;
        characterDescription: string;
        style?: string;
    }): Promise<string> {
        const { basePrompt, characterDescription, style = 'photorealistic' } = params;

        const prompt = `You are an expert at writing prompts for AI image generation models.

Character description:
${characterDescription}

Base prompt: ${basePrompt}
Style: ${style}

Enhance this prompt to:
1. Include specific details about the character's physical features
2. Add technical photography terms for quality (16K, photorealistic, etc.)
3. Specify lighting and composition
4. Maintain consistency with the character description

Return ONLY the enhanced prompt, no explanation.

Enhanced prompt:`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Generate a chat response as the character
     */
    async generateChatResponse(params: {
        characterPersonality: string;
        userMessage: string;
        conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }): Promise<string> {
        const { characterPersonality, userMessage, conversationHistory = [] } = params;

        let prompt = `You are roleplaying as: ${characterPersonality}

${conversationHistory.length > 0 ? 'Previous conversation:\n' : ''}`;

        conversationHistory.forEach((msg) => {
            prompt += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n`;
        });

        prompt += `\nUser: ${userMessage}\n\nRespond authentically as this character. Keep it natural and conversational. Use emojis naturally.\n\nYour response:`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }
}

export const geminiClient = new GeminiClient();
