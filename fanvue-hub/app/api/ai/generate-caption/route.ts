import { NextRequest, NextResponse } from 'next/server';
import { geminiHelper } from '@/lib/ai/gemini-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { scenario, characterName, tone = 'flirty' } = body;

        if (!scenario) {
            return NextResponse.json(
                { success: false, error: 'Missing scenario' },
                { status: 400 }
            );
        }

        const imageDescription = `${characterName || 'A beautiful influencer'} in this scene: ${scenario}`;
        const caption = await geminiHelper.generateCaption(imageDescription, tone as any);

        return NextResponse.json({
            success: true,
            caption,
        });

    } catch (error: any) {
        console.error('Caption generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate caption' },
            { status: 500 }
        );
    }
}
