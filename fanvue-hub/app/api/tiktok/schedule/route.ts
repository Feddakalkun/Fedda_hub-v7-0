import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            tiktokConnectionId,
            characterSlug,
            imageUrl,
            caption,
            hashtags,
            scheduledFor,
            templateUsed
        } = body;

        let connectionId = tiktokConnectionId;

        // If characterSlug provided, find connection
        if (!connectionId && characterSlug) {
            const character = await prisma.character.findUnique({
                where: { slug: characterSlug },
                include: { tiktokConnection: true }
            });
            if (character?.tiktokConnection) {
                connectionId = character.tiktokConnection.id;
            }
        }

        if (!connectionId) {
            return NextResponse.json({ error: 'No connection ID or character slug provided' }, { status: 400 });
        }

        // Verify connection exists
        const connection = await prisma.tikTokConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // Create scheduled post
        const scheduledPost = await prisma.scheduledPost.create({
            data: {
                tiktokConnectionId: connectionId,
                imageUrl,
                caption,
                hashtags: hashtags || '',
                scheduledFor: new Date(scheduledFor),
                status: 'pending',
                templateUsed
            }
        });

        return NextResponse.json({
            success: true,
            scheduledPost
        });

    } catch (error: any) {
        console.error('Schedule post error:', error);
        return NextResponse.json(
            { error: 'Failed to schedule post', details: error.message },
            { status: 500 }
        );
    }
}
