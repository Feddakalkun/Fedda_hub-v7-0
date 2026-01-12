import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clientId, clientSecret,
            geminiApiKey, falApiKey, elevenLabsApiKey,
            comfyuiUrl,
            // New Keys
            azureSpeechKey, azureSpeechRegion,
            googleCloudTtsKey,
            awsAccessKeyId, awsSecretAccessKey, awsRegion,
            uberduckApiKey, uberduckApiSecret
        } = body;

        // Upsert the global configuration
        await prisma.appConfig.upsert({
            where: { id: 'global' },
            update: {
                ...(clientId && { clientId }),
                ...(clientSecret && { clientSecret }),
                ...(geminiApiKey && { geminiApiKey }),
                ...(falApiKey && { falApiKey }),
                ...(elevenLabsApiKey && { elevenLabsApiKey }),
                ...(comfyuiUrl && { comfyuiUrl }),

                // Update New Keys
                ...(azureSpeechKey && { azureSpeechKey }),
                ...(azureSpeechRegion && { azureSpeechRegion }),
                ...(googleCloudTtsKey && { googleCloudTtsKey }),
                ...(awsAccessKeyId && { awsAccessKeyId }),
                ...(awsSecretAccessKey && { awsSecretAccessKey }),
                ...(awsRegion && { awsRegion }),
                ...(uberduckApiKey && { uberduckApiKey }),
                ...(uberduckApiSecret && { uberduckApiSecret }),

                setupCompleted: true,
            },
            create: {
                id: 'global',
                clientId: clientId || '',
                clientSecret: clientSecret || '',
                geminiApiKey: geminiApiKey || '',
                falApiKey: falApiKey || '',
                elevenLabsApiKey: elevenLabsApiKey || '',
                comfyuiUrl: comfyuiUrl || 'http://127.0.0.1:8188',

                // Create New Keys
                azureSpeechKey: azureSpeechKey || '',
                azureSpeechRegion: azureSpeechRegion || 'eastus',
                googleCloudTtsKey: googleCloudTtsKey || '',
                awsAccessKeyId: awsAccessKeyId || '',
                awsSecretAccessKey: awsSecretAccessKey || '',
                awsRegion: awsRegion || 'us-east-1',
                uberduckApiKey: uberduckApiKey || '',
                uberduckApiSecret: uberduckApiSecret || '',

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
            clientId: config?.clientId || '',
            hasClientSecret: !!config?.clientSecret,
            geminiApiKey: config?.geminiApiKey ? '••••••••' + config.geminiApiKey.slice(-4) : '',
            falApiKey: config?.falApiKey ? '••••••••' + config.falApiKey.slice(-4) : '',
            elevenLabsApiKey: config?.elevenLabsApiKey ? '••••••••' + config.elevenLabsApiKey.slice(-4) : '',
            comfyuiUrl: config?.comfyuiUrl || 'http://127.0.0.1:8188',

            // Return New Keys (Masked)
            azureSpeechKey: config?.azureSpeechKey ? '••••••••' + config.azureSpeechKey.slice(-4) : '',
            azureSpeechRegion: config?.azureSpeechRegion || '',
            googleCloudTtsKey: config?.googleCloudTtsKey ? '••••••••' + config.googleCloudTtsKey.slice(-4) : '',
            awsAccessKeyId: config?.awsAccessKeyId ? '••••••••' + config.awsAccessKeyId.slice(-4) : '',
            awsSecretAccessKey: config?.awsSecretAccessKey ? '••••••••' + config.awsSecretAccessKey.slice(-4) : '',
            awsRegion: config?.awsRegion || '',
            uberduckApiKey: config?.uberduckApiKey ? '••••••••' + config.uberduckApiKey.slice(-4) : '',
            uberduckApiSecret: config?.uberduckApiSecret ? '••••••••' + config.uberduckApiSecret.slice(-4) : '',
        }
    });
}
