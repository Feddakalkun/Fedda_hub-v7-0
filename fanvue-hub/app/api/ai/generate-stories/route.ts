import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate unique, story-driven content ideas using Gemini
 * Focus on what makes people subscribe and tip
 */
export async function POST(request: NextRequest) {
    try {
        const { characterName, contentType, count = 10 } = await request.json();

        const GEMINI_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_KEY) {
            return NextResponse.json({ success: false, error: 'Gemini API not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are an expert content strategist for adult creators on Fanvue/OnlyFans.

Generate ${count} unique content ideas for a character named "${characterName}".

Content type requested: ${contentType || 'mixed'}

IMPORTANT: Focus on what drives ENGAGEMENT and TIPS:
1. Personal connection - viewer feels like they're special
2. Teasing/anticipation - makes them want MORE
3. Story progression - what happens next?
4. Fantasy fulfillment - scenarios viewers dream about
5. Exclusivity - "just for you" feeling
6. Emotional hooks - vulnerability, confidence, playfulness

SPECIAL FEATURE: The AI model can render TEXT in images beautifully!
Include text elements in prompts like:
- Handwritten notes ("miss you", "thinking of you", "wish you were here")
- Writing on body ("yours", names, dates)
- Signs/papers ("subscribe for more", "exclusive content")
- Phone screens with messages
- Bathroom mirrors with lipstick writing
- Polaroid photos with captions

For each idea, provide:
- title: Short catchy title (5-10 words)
- story: The narrative/context (what's the setup?)
- outfit: Specific clothing description
- action: What they're doing/pose
- location: Where this takes place
- mood: The emotional tone
- text_element: Optional text to include in the image (handwritten note, etc.)
- caption_hook: A teasing caption that drives engagement
- cta: Call to action (tip prompt, question, etc.)

Format as JSON array. Be CREATIVE and UNIQUE.
Focus on scenarios that make viewers feel a personal connection.
Include text elements in at least 50% of the ideas.

Return ONLY valid JSON array, no markdown.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse JSON (handle potential markdown wrapping)
        let ideas;
        try {
            const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            ideas = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({ success: false, error: 'Failed to parse content ideas' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            ideas,
        });

    } catch (error: any) {
        console.error('Story generation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to generate stories',
        }, { status: 500 });
    }
}
