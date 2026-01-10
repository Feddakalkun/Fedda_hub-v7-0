import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


/**
 * GET /api/posts - Retrieve all posts
 */
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                character: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, posts });
    } catch (error: any) {
        console.error('[Posts API] GET error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/posts - Create a new post
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            characterId,
            characterName,
            title,
            content,
            mediaUrls,
            scenario,
            scheduledFor,
        } = body;

        // If no characterId, try to find or create a character by name
        let actualCharacterId = characterId;
        if (!actualCharacterId && characterName) {
            let character = await prisma.character.findUnique({
                where: { name: characterName },
            });

            if (!character) {
                // Create a new character
                character = await prisma.character.create({
                    data: {
                        name: characterName,
                        description: `Auto-created character for ${characterName}`,
                        isActive: true,
                    },
                });
            }

            actualCharacterId = character.id;
        }

        if (!actualCharacterId) {
            return NextResponse.json(
                { success: false, error: 'Character ID or name is required' },
                { status: 400 }
            );
        }

        // Create the post
        const post = await prisma.post.create({
            data: {
                characterId: actualCharacterId,
                title: title || scenario || 'Untitled',
                content: content || '',
                mediaUrls: JSON.stringify(mediaUrls || []),
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                status: 'draft',
            },
            include: {
                character: true,
            },
        });

        return NextResponse.json({ success: true, post });
    } catch (error: any) {
        console.error('[Posts API] POST error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/posts - Update a post
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, fanvuePostId, publishedAt, errorMessage } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Post ID is required' },
                { status: 400 }
            );
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(fanvuePostId && { fanvuePostId }),
                ...(publishedAt && { publishedAt: new Date(publishedAt) }),
                ...(errorMessage !== undefined && { errorMessage }),
            },
            include: {
                character: true,
            },
        });

        return NextResponse.json({ success: true, post });
    } catch (error: any) {
        console.error('[Posts API] PATCH error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/posts - Delete a post
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Post ID is required' },
                { status: 400 }
            );
        }

        await prisma.post.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Posts API] DELETE error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
