import { NextRequest, NextResponse } from 'next/server';
import { geminiHelper } from '@/lib/ai/gemini-helper';

export async function POST(request: NextRequest) {
    try {
        const { characterName, scenario } = await request.json();

        const prompt = `You are ${characterName}, a flirty AI influencer. Write a short 15-20 second voice message for this scenario: ${scenario}.

Rules:
- First person perspective
- Flirty and engaging tone
- Natural, conversational
- 2-3 sentences max
- End with a teasing question or call-to-action

Return ONLY the script, nothing else.`;

        const model = (await import('@google/generative-ai')).GoogleGenerativeAI;
        const genAI = new model(process.env.GEMINI_API_KEY!);
        const aiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await aiModel.generateContent(prompt);
        const script = result.response.text().trim();

        return NextResponse.json({
            success: true,
            script,
        });

    } catch (error: any) {
        console.error('Script generation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
