import { NextRequest, NextResponse } from 'next/server';
import { loadCharacterMemories } from '@/lib/memory';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId');
    const userId = searchParams.get('userId') || 'user-local';

    if (!characterId) {
        return NextResponse.json({ error: 'Missing characterId' }, { status: 400 });
    }

    try {
        const memories = await loadCharacterMemories(characterId, userId);

        return NextResponse.json({
            success: true,
            count: memories.length,
            memories,
            userId,
            characterId
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
