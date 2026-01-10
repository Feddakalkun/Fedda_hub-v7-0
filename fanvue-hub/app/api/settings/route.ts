import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        let config = await prisma.appConfig.findUnique({
            where: { id: 'global' }
        });

        if (!config) {
            config = await prisma.appConfig.create({
                data: { id: 'global' }
            });
        }

        // Mask sensitive keys if needed, but for this local app user might want to edit them
        // We will return them as is for convenience since it's a local tool
        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Update global config
        const config = await prisma.appConfig.upsert({
            where: { id: 'global' },
            create: {
                id: 'global',
                geminiApiKey: body.geminiApiKey,
                falApiKey: body.falApiKey,
                elevenLabsApiKey: body.elevenLabsApiKey,
            },
            update: {
                geminiApiKey: body.geminiApiKey,
                falApiKey: body.falApiKey,
                elevenLabsApiKey: body.elevenLabsApiKey,
            }
        });

        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
