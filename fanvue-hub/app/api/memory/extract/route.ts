import { NextRequest, NextResponse } from 'next/server';
import { extractMemoriesFromMessage, saveMemories, applyMemoryDecay } from '@/lib/memory';

export async function POST(req: NextRequest) {
    try {
        const { text, characterId, userId = 'user-local' } = await req.json();

        if (!text || !characterId) {
            return NextResponse.json({ error: 'Missing text or characterId' }, { status: 400 });
        }

        console.log(`[Memory API] Processing: "${text.substring(0, 50)}..." for Char ${characterId}`);

        // Async extraction
        const memories = await extractMemoriesFromMessage(text);

        if (memories.length > 0) {
            await saveMemories(characterId, userId, memories, text);
        }

        return NextResponse.json({ success: true, count: memories.length });

    } catch (e: any) {
        console.error("Memory Extract API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
