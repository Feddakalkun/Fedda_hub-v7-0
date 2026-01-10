import { NextRequest, NextResponse } from 'next/server';
import { calculateTemperature, getMoodLevel, type Message } from '@/lib/temperature';
import keywordsConfig from '@/config/nsfw_keywords.json';

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Convert phrase strings to RegExp objects
        const config = {
            keywords: keywordsConfig,
            phrases: keywordsConfig.phrases.map(p => new RegExp(p, 'i')),
            escalationFactor: 1.5 // 50% boost if conversation is already heated
        };

        const temperature = calculateTemperature(
            message,
            history || [],
            config
        );

        const mood = getMoodLevel(temperature);

        // Find matching keywords for transparency
        const words = message.toLowerCase().split(/\s+/);
        const keywordsFound: string[] = [];

        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (config.keywords.explicit.includes(cleanWord)) {
                keywordsFound.push(cleanWord);
            } else if (config.keywords.moderate.includes(cleanWord)) {
                keywordsFound.push(cleanWord);
            } else if (config.keywords.mild.includes(cleanWord)) {
                keywordsFound.push(cleanWord);
            }
        });

        return NextResponse.json({
            score: temperature,
            mood,
            keywords_found: [...new Set(keywordsFound)], // Remove duplicates
            message: `Temperature: ${temperature}% - ${mood.toUpperCase()} mode`
        });

    } catch (error: any) {
        console.error('[Temperature API] Error:', error);
        return NextResponse.json(
            {
                error: 'Temperature calculation failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}
