import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({
                success: false,
                error: 'Image URL is required'
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

        // Save to GeneratedContent table
        const savedContent = await prisma.generatedContent.create({
            data: {
                characterId: character.id,
                imageUrl: imageUrl,
                prompt: '', // We could store the prompt here if passed
                isFavorite: false
            }
        });

        return NextResponse.json({
            success: true,
            content: savedContent
        });

    } catch (error: any) {
        console.error('Save image error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
