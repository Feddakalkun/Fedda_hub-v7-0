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
        const workflowPath = path.join(process.cwd(), '../assets/workflows/Z-IMAGE-new-api.json');
        const workflowTemplate = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));

        // Build avatar prompt
        const avatarPrompt = buildAvatarPrompt(character);

        // Update workflow with character-specific settings
        workflowTemplate["33"].inputs.string = avatarPrompt; // Positive prompt
        workflowTemplate["34"].inputs.string = "blurry, low quality, distorted face, bad anatomy"; // Negative
        workflowTemplate["30"].inputs.width = 1024; // Square avatar
        workflowTemplate["30"].inputs.height = 1024;
        workflowTemplate["30"].inputs.aspect_ratio = "1:1";

        // FIX: Connect CLIP to the LoRA loader output (node 126, output 1)
        // Previously it was connected directly to the CLIP loader (node 18), 
        // which meant LoRAs weren't affecting the text conditioning.
        workflowTemplate["6"].inputs.clip = ["126", 1];
        workflowTemplate["7"].inputs.clip = ["126", 1];

        // Fix SaveImage path - use ComfyUI output folder
        workflowTemplate["9"].inputs.filename_prefix = `avatars/${character.slug}`;

        // Add LoRA if specified
        if (character.loraPath) {
            // Power Lora Loader (rgthree) in the updated workflow uses the lora_1 structure
            const loraPath = character.loraPath.replace(/\//g, '\\');

            console.log(`🎨 Applying LoRA via lora_1: ${loraPath}`);

            const node126 = workflowTemplate["126"];

            node126.inputs.lora_1 = {
                on: true,
                lora: loraPath,
                strength: 1.0
            };

            // Clear the old "Add Lora" key to avoid confusion
            const addLoraKey = Object.keys(node126.inputs).find(k => k.includes("Add Lora"));
            if (addLoraKey) {
                node126.inputs[addLoraKey] = "";
            }
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
