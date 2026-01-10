import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { characterId, userId = 'user-local' } = await req.json();

        if (!characterId) return NextResponse.json({ error: 'Missing characterId' }, { status: 400 });

        console.log(`[Memory] Clearing memories for Char ${characterId}`);

        // @ts-ignore
        if (prisma.characterMemory) {
            // @ts-ignore
            await prisma.characterMemory.deleteMany({
                where: { characterId, userId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Clear Memory Failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
