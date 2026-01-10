import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get connection by character slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // ✅ FIXED: Await params before using (Next.js 16+)
        const { slug } = await params;

        const character = await prisma.character.findUnique({
            where: { slug },
            include: { tiktokConnection: true }
        });

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        const connection = character.tiktokConnection;

        if (!connection) {
            return NextResponse.json({ connected: false });
        }

        return NextResponse.json({
            connected: true,
            account: {
                tiktokUsername: connection.tiktokUsername,
                tiktokDisplayName: connection.tiktokDisplayName,
                tiktokAvatar: connection.tiktokAvatar,
                autoPostEnabled: connection.autoPostEnabled,
                lastPostedAt: connection.lastPostedAt,
                defaultCaption: connection.defaultCaption
            }
        });
    } catch (error) {
        console.error('TikTok check error:', error);
        return NextResponse.json({ error: 'Failed to check connection' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // ✅ FIXED: Await params before using (Next.js 16+)
        const { slug } = await params;

        const character = await prisma.character.findUnique({
            where: { slug },
            include: { tiktokConnection: true }
        });

        if (!character || !character.tiktokConnection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        await prisma.tikTokConnection.delete({
            where: { id: character.tiktokConnection.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('TikTok disconnect error:', error);
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}
