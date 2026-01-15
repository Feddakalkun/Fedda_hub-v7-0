import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ComfyUIClient } from '@/lib/generators/comfyui-client';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // Get character
        const character = await prisma.character.findUnique({
            where: { slug },
        });

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        console.log(`🎭 Character loaded: ${character.name}, LoRA Path: "${character.loraPath}"`);

        // Load Z-IMAGE workflow
        const workflowPath = path.join(process.cwd(), '../assets/workflows/flux-image-generation.json');
        const workflowTemplate = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));

        // Build avatar prompt
        const avatarPrompt = buildAvatarPrompt(character);

        // Update workflow with character-specific settings
        // API format uses object keys for nodes

        // Positive prompt (node 171 - ImpactWildcardProcessor)
        if (workflowTemplate["171"]?.inputs) {
            workflowTemplate["171"].inputs.wildcard_text = avatarPrompt;
            workflowTemplate["171"].inputs.populated_text = avatarPrompt;
        }

        // Negative prompt (node 34 - String Literal)
        if (workflowTemplate["34"]?.inputs) {
            workflowTemplate["34"].inputs.string = "blurry, low quality, distorted face, bad anatomy";
        }

        // Aspect Ratio (node 30) - Set to Square 1:1 for Avatars
        if (workflowTemplate["30"]?.inputs) {
            workflowTemplate["30"].inputs.width = 1024;
            workflowTemplate["30"].inputs.height = 1024;
            workflowTemplate["30"].inputs.aspect_ratio = "1:1";
        }

        // Fix SaveImage path - use ComfyUI output folder
        if (workflowTemplate["9"]?.inputs) {
            workflowTemplate["9"].inputs.filename_prefix = `avatars/${character.slug}`;
        }

        // Add LoRA if specified (Node 131 - Lora Loader Stack rgthree)
        if (character.loraPath && workflowTemplate["131"]?.inputs) {
            // Ensure path separators are correct for Windows
            const loraPath = character.loraPath.replace(/\//g, '\\');
            console.log(`🎨 Applying LoRA via rgthree stack: ${loraPath}`);

            // Set Slot 1
            workflowTemplate["131"].inputs.lora_01 = loraPath;
            workflowTemplate["131"].inputs.strength_01 = 1.0;

            // Clear other slots to be safe
            workflowTemplate["131"].inputs.lora_02 = "None";
            workflowTemplate["131"].inputs.strength_02 = 0;
            workflowTemplate["131"].inputs.lora_03 = "None";
            workflowTemplate["131"].inputs.strength_03 = 0;
            workflowTemplate["131"].inputs.lora_04 = "None";
            workflowTemplate["131"].inputs.strength_04 = 0;
        }

        // Random seed
        workflowTemplate["3"].inputs.seed = Math.floor(Math.random() * 1000000000000);

        console.log(`📸 Generating avatar for ${character.name} with prompt: "${buildAvatarPrompt(character).substring(0, 100)}..."`);



        // Queue to ComfyUI
        const comfyClient = new ComfyUIClient();
        const isReady = await comfyClient.isAvailable();

        if (!isReady) {
            return NextResponse.json({ error: 'ComfyUI is not available' }, { status: 503 });
        }

        const { prompt_id } = await comfyClient.queueWorkflow({
            workflow: workflowTemplate
        });

        console.log(`✅ Workflow queued with prompt_id: ${prompt_id}`);
        // Return immediately - frontend will monitor via WebSocket
        return NextResponse.json({
            success: true,
            promptId: prompt_id,
            message: 'Generation started'
        });

    } catch (error: any) {
        console.error('Avatar generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function buildAvatarPrompt(character: any): string {
    // Keep it minimal to avoid "generic face" bias from the base model
    const baseParts = [
        "high quality",
        "detailed face",
        "neutral background"
    ];

    if (character.appearance) {
        baseParts.unshift(character.appearance);
    }

    // Trigger word
    baseParts.unshift(`Lila character`);

    return baseParts.join(", ");
}
