import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const character = await prisma.character.findUnique({
            where: { slug },
        });

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // Return details + connection status
        return NextResponse.json({
            success: true,
            character: {
                ...character,
                isConnected: !!character.accessToken, // Boolean flag
                accessToken: undefined, // Hide tokens
                refreshToken: undefined
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const character = await prisma.character.update({
            where: { slug },
            data: {
                name: body.name,
                handle: body.handle,
                bio: body.bio,
                loraPath: body.loraPath,
                qwenLoraPath: body.qwenLoraPath,
                appearance: body.appearance,
                avatarUrl: body.avatarUrl,
                voiceProvider: body.voiceProvider,
                voiceModel: body.voiceModel,
                voiceId: body.voiceId,
                voiceDescription: body.voiceDescription,
                llmModel: body.llmModel,
                systemInstruction: body.systemInstruction, // Added
            }
        });

        return NextResponse.json({ success: true, character });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        await prisma.character.delete({ where: { slug } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
