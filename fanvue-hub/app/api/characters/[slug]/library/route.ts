import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // Find the character
        const character = await prisma.character.findUnique({
            where: { slug },
            include: {
                generatedContent: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!character) {
            return NextResponse.json({
                success: false,
                error: 'Character not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            content: character.generatedContent
        });

    } catch (error: any) {
        console.error('Get library error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
