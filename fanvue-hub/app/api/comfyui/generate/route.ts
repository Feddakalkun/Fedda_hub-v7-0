import { NextRequest, NextResponse } from 'next/server';
import { getAppConfig } from '@/lib/config-helper';
import fs from 'fs';
import path from 'path';

/**
 * Generate images using ComfyUI with character-specific LoRA
 */
export async function POST(request: NextRequest) {
    const config = await getAppConfig();
    const comfyUrl = config.comfyuiUrl;

    try {
        const body = await request.json();
        const { characterSlug, prompt, negativePrompt, numImages, loraPath, workflow, aspectRatio } = body;

        // If a raw workflow is provided, use the old behavior
        if (workflow) {
            const response = await fetch(`${comfyUrl}/prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: workflow,
                    client_id: body.client_id || 'character-hub',
                }),
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ComfyUI returned ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            return NextResponse.json({
                success: true,
                promptId: result.prompt_id,
                number: result.number,
            });
        }

        // New character-based generation
        if (!prompt || !loraPath) {
            return NextResponse.json({
                success: false,
                error: 'Prompt and LoRA path are required',
            }, { status: 400 });
        }

        // Load the API-format workflow from assets folder
        const workflowPath = path.join(process.cwd(), '../assets/workflows/Flux_ImageGen.json');
        let workflowTemplate: any;

        try {
            workflowTemplate = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
        } catch (e: any) {
            console.error('Could not load workflow template:', e.message);
            console.warn('Attempted path:', workflowPath);
            return NextResponse.json({
                success: false,
                error: `Workflow not found. Please ensure z-image-new1.json exists in assets/workflows/`,
            }, { status: 500 });
        }

        // Update workflow with character-specific parameters
        // API format uses object keys for nodes

        // Update positive prompt (node 171 - ImpactWildcardProcessor)
        // We set both wildcard_text and populated_text to ensure consistency
        if (workflowTemplate['171']?.inputs) {
            workflowTemplate['171'].inputs.wildcard_text = prompt;
            workflowTemplate['171'].inputs.populated_text = prompt;
        } else if (workflowTemplate['33']?.inputs) {
            // Fallback to old node if something is wrong, though we expect 171
            workflowTemplate['33'].inputs.string = prompt;
        }

        // Update negative prompt (node 34 - String Literal)
        if (workflowTemplate['34']?.inputs) {
            workflowTemplate['34'].inputs.string = negativePrompt || '';
        }

        // Update LoRA (node 131 - Lora Loader Stack rgthree)
        if (workflowTemplate['131']?.inputs) {
            // Check if we have multiple slots
            const slots = body.loraSlots || [];

            if (slots.length > 0) {
                // Map up to 4 slots
                for (let i = 1; i <= 4; i++) {
                    const slot = slots[i - 1];
                    const num = i < 10 ? `0${i}` : i;

                    if (slot && slot.path && slot.path !== '') {
                        workflowTemplate['131'].inputs[`lora_${num}`] = slot.path;
                        workflowTemplate['131'].inputs[`strength_${num}`] = slot.strength ?? 1.0;
                    } else {
                        workflowTemplate['131'].inputs[`lora_${num}`] = "None";
                        workflowTemplate['131'].inputs[`strength_${num}`] = 0;
                    }
                }
            } else {
                // Legacy: Single LoRA
                workflowTemplate['131'].inputs.lora_01 = loraPath;
                workflowTemplate['131'].inputs.strength_01 = 1.0;

                workflowTemplate['131'].inputs.lora_02 = "None";
                workflowTemplate['131'].inputs.strength_02 = 0;
                workflowTemplate['131'].inputs.lora_03 = "None";
                workflowTemplate['131'].inputs.strength_03 = 0;
                workflowTemplate['131'].inputs.lora_04 = "None";
                workflowTemplate['131'].inputs.strength_04 = 0;
            }
        }

        // Update Seed (node 3 - KSampler)
        if (workflowTemplate['3']?.inputs) {
            workflowTemplate['3'].inputs.seed = Math.floor(Math.random() * 1000000000000000);
        }

        // Update batch size (node 13 - EmptyLatent)
        if (workflowTemplate['13']?.inputs) {
            workflowTemplate['13'].inputs.batch_size = numImages || 1;
        }

        // Update AspectRatio and Resolution (node 30 - AspectRatioImageSize)
        if (workflowTemplate['30']?.inputs) {
            workflowTemplate['30'].inputs.width = 1280; // Increased from 768
            workflowTemplate['30'].inputs.height = 0; // Auto-calculated
            workflowTemplate['30'].inputs.aspect_ratio = aspectRatio || '1:1';
            workflowTemplate['30'].inputs.direction = 'Vertical';
        }

        // CRITICAL FIX: Update SaveImage node (node 9) filename prefix to use timestamp
        // This ensures each generation creates a NEW file instead of overwriting the same one
        const timestamp = Date.now();
        if (workflowTemplate['9']?.inputs) {
            workflowTemplate['9'].inputs.filename_prefix = `zimage/${characterSlug}_${timestamp}_`;
        }

        console.log('\n=== CHARACTER IMAGE GENERATION ===');
        console.log('Character:', characterSlug);
        console.log('Prompt:', prompt.substring(0, 100));
        console.log('LoRA:', loraPath);
        console.log('Num Images:', numImages);
        console.log('Filename Prefix:', `zimage/${characterSlug}_${timestamp}_`);
        console.log('Nodes updated:', {
            prompt: !!workflowTemplate['171'],
            negative: !!workflowTemplate['34'],
            lora: !!workflowTemplate['131'],
            latent: !!workflowTemplate['13'],
            sampler: !!workflowTemplate['3'],
            saveImage: !!workflowTemplate['9']
        });
        console.log('===================================\n');

        const response = await fetch(`${comfyUrl}/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: workflowTemplate,
                client_id: `char_${characterSlug}`,
            }),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ComfyUI returned ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            promptId: result.prompt_id,
            number: result.number,
        });

    } catch (error: any) {
        console.error('Failed to generate images:', error.message);

        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
