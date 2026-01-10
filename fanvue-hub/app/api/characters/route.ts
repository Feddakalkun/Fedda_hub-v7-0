import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const characters = await prisma.character.findMany({
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                handle: true,
                avatarUrl: true,
                bio: true,
                voiceProvider: true,
                voiceModel: true,
                voiceId: true,
                voiceDescription: true,
                llmModel: true,
                systemInstruction: true, // Added
                // Do NOT return full tokens in list view unless needed
                accessToken: false,
                refreshToken: false,
            }
        });
        return NextResponse.json({ success: true, characters });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, handle, bio, loraPath, qwenLoraPath, appearance, voiceProvider, voiceModel, voiceId, voiceDescription, llmModel, systemInstruction } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate slug (simple)
        let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Ensure unique slug
        const exists = await prisma.character.findUnique({ where: { slug } });
        if (exists) {
            slug = `${slug}-${Date.now()}`;
        }

        const character = await prisma.character.create({
            data: {
                name,
                handle,
                bio,
                slug,
                loraPath,
                qwenLoraPath,
                appearance,
                voiceProvider,
                voiceModel,
                voiceId,
                voiceDescription,
                llmModel: llmModel || 'mistral',
                systemInstruction,
            }
        });

        return NextResponse.json({ success: true, character });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
