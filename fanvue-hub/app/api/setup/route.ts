import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clientId, clientSecret,
            geminiApiKey, falApiKey, elevenLabsApiKey,
            comfyuiUrl
        } = body;

        // Upsert the global configuration
        // Only update fields that are provided (undefined fields are ignored by Prisma update usually, strictly checks needed?)
        // Prisma update needs explicit undefined check if we want partial updates, but here we probably submit the whole form.
        // Let's use spread carefully.

        await prisma.appConfig.upsert({
            where: { id: 'global' },
            update: {
                ...(clientId && { clientId }),
                ...(clientSecret && { clientSecret }),
                ...(geminiApiKey && { geminiApiKey }),
                ...(falApiKey && { falApiKey }),
                ...(elevenLabsApiKey && { elevenLabsApiKey }),
                ...(comfyuiUrl && { comfyuiUrl }),
                setupCompleted: true, // Mark true if we are saving at all? Or only if critical keys exist?
            },
            create: {
                id: 'global',
                clientId: clientId || '',
                clientSecret: clientSecret || '',
                geminiApiKey: geminiApiKey || '',
                falApiKey: falApiKey || '',
                elevenLabsApiKey: elevenLabsApiKey || '',
                comfyuiUrl: comfyuiUrl || 'http://127.0.0.1:8188',
                setupCompleted: true,
            },
        });

        console.log('[Setup] App configuration updated successfully.');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Setup] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const config = await prisma.appConfig.findUnique({
        where: { id: 'global' },
    });

    return NextResponse.json({
        setupCompleted: config?.setupCompleted || false,
        config: {
            // Return values so user can see what's set (mask secrets if desired, but for local app user might want to see)
            // Let's Mask details for safety in UI
            clientId: config?.clientId || '',
            hasClientSecret: !!config?.clientSecret,
            geminiApiKey: config?.geminiApiKey ? '••••••••' + config.geminiApiKey.slice(-4) : '',
            falApiKey: config?.falApiKey ? '••••••••' + config.falApiKey.slice(-4) : '',
            elevenLabsApiKey: config?.elevenLabsApiKey ? '••••••••' + config.elevenLabsApiKey.slice(-4) : '',
            comfyuiUrl: config?.comfyuiUrl || 'http://127.0.0.1:8188',
        }
    });
}
