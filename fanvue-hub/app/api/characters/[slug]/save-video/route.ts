import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { videoUrl } = await request.json();

        if (!videoUrl) {
            return NextResponse.json({
                success: false,
                error: 'Video URL is required'
            }, { status: 400 });
        }

        // Find the character
        const character = await prisma.character.findUnique({
            where: { slug }
        });

        if (!character) {
            return NextResponse.json({
                success: false,
                error: 'Character not found'
            }, { status: 404 });
        }

        // Save to GeneratedContent table (videos can use the same table)
        const savedContent = await prisma.generatedContent.create({
            data: {
                characterId: character.id,
                imageUrl: videoUrl, // Store video URL in imageUrl field (or we could rename it to mediaUrl)
                prompt: '', // Could store the spoken text here
                mood: 'lipsync', // Use mood field to identify videos
                isFavorite: false
            }
        });

        return NextResponse.json({
            success: true,
            content: savedContent
        });

    } catch (error: any) {
        console.error('Save video error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
