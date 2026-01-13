import { NextRequest, NextResponse } from 'next/server';
import { getAppConfig } from '@/lib/config-helper';
import fs from 'fs';
import path from 'path';

/**
 * Generate Video using Wan 2.1 Workflow (Image-to-Video)
 */
export async function POST(request: NextRequest) {
    const config = await getAppConfig();
    const comfyUrl = config.comfyuiUrl;

    try {
        const body = await request.json();
        const { prompt, imageFilename, resolution, seed } = body;

        if (!prompt || !imageFilename) {
            return NextResponse.json({
                success: false,
                error: 'Prompt and Source Image are required',
            }, { status: 400 });
        }

        // Load the Wan 2.1 workflow
        // Using wan.json with Lynx - now has fallback for insightface
        const workflowTemplate = JSON.parse(fs.readFileSync(path.join(process.cwd(), '../assets/workflows/image_to_video_wan.json'), 'utf-8'));
        // workflowTemplate is loaded above

        try {
            // JSON already parsed above
        } catch (e: any) {
            console.error('Could not load Wan 2.1 workflow:', e.message);
            return NextResponse.json({
                success: false,
                error: `Workflow file not found: wan.json`,
            }, { status: 500 });
        }

        // === Apply Dynamic Overrides for Wan 2.1 (wan.json) ===

        // 1. Set Source Image (Node 537: LoadImage)
        let cleanImageFilename = imageFilename;
        try {
            if (cleanImageFilename.includes('?') || cleanImageFilename.includes('/')) {
                const urlObj = new URL(cleanImageFilename, 'http://localhost');
                const params = new URLSearchParams(urlObj.search);
                if (params.has('filename')) {
                    cleanImageFilename = params.get('filename')!;
                } else {
                    const pathname = urlObj.pathname;
                    if (pathname && pathname !== '/') {
                        cleanImageFilename = path.basename(pathname);
                    }
                }
            }
        } catch (e) {
            if (cleanImageFilename.includes('/')) {
                cleanImageFilename = path.basename(cleanImageFilename);
            }
        }

        // Ensure image is in ComfyUI Input folder
        const comfyBasePath = path.resolve(process.cwd(), '../ComfyUI');
        const inputDir = path.join(comfyBasePath, 'input');
        const outputDir = path.join(comfyBasePath, 'output');

        // Extract subfolder if present in the URL
        let subfolder = '';
        try {
            if (imageFilename.includes('?')) {
                const urlObj = new URL(imageFilename, 'http://localhost');
                const params = new URLSearchParams(urlObj.search);
                if (params.has('subfolder')) {
                    subfolder = params.get('subfolder')!;
                }
            }
        } catch (e) {
            // Ignore parse errors
        }

        // Try to find the image in output folder (with or without subfolder)
        let sourcePath = path.join(outputDir, cleanImageFilename);
        if (subfolder) {
            sourcePath = path.join(outputDir, subfolder, cleanImageFilename);
        } else if (!fs.existsSync(sourcePath)) {
            // Try searching in common subfolders
            const commonSubfolders = ['zimage', 'avatars', 'flux', 'comfyui'];
            for (const sub of commonSubfolders) {
                const tryPath = path.join(outputDir, sub, cleanImageFilename);
                if (fs.existsSync(tryPath)) {
                    sourcePath = tryPath;
                    break;
                }
            }
        }

        const destPath = path.join(inputDir, cleanImageFilename);

        if (!fs.existsSync(destPath)) {
            if (fs.existsSync(sourcePath)) {
                try {
                    fs.copyFileSync(sourcePath, destPath);
                    console.log(`✓ Copied image from ${sourcePath} to ${destPath}`);
                } catch (copyError) {
                    console.error("Failed to copy image to input:", copyError);
                }
            } else {
                console.warn(`Image ${cleanImageFilename} not found at ${sourcePath}`);
            }
        }

        // 4. Calculate Params (Resolution, Frames, Steps)
        const finalResolution = resolution || 512;
        let numFrames = 81;
        let steps = 20;

        // Optimize settings based on resolution
        if (finalResolution <= 256) {
            numFrames = 57; // ~3.5s (increased from 33)
            steps = 25;
        } else if (finalResolution <= 512) {
            numFrames = 81; // ~5s (Standard Wan 2.1 length)
            steps = 30;
        } else {
            numFrames = 105; // ~6.5s
            steps = 35;
        }

        // 5. Set Seed (Node 3: KSampler)
        const finalSeed = seed || Math.floor(Math.random() * 1000000000000000);
        if (workflowTemplate['3']?.inputs) {
            workflowTemplate['3'].inputs.seed = finalSeed;
            workflowTemplate['3'].inputs.steps = steps;
        }

        // 6. Map Inputs for Basic Workflow
        // 1. Set Image Input (LoadImage Node 52)
        if (workflowTemplate['52']?.inputs) {
            workflowTemplate['52'].inputs.image = cleanImageFilename;
        }

        // 2. Set Prompt (Node 6)
        if (workflowTemplate['6']?.inputs) {
            workflowTemplate['6'].inputs.text = prompt;
        }

        // 3. Set Negative Prompt (Node 7)
        if (workflowTemplate['7']?.inputs) {
            workflowTemplate['7'].inputs.text = "Watermark, Text, blurred, deformed, noise, low quality";
        }



        // 5. Override Model to FP16 (Node 37) - Confirmed Installed
        if (workflowTemplate['37']?.inputs) {
            workflowTemplate['37'].inputs.unet_name = 'wan2.1_i2v_480p_14B_fp16.safetensors';
        }

        // 6. Set Video Resolution & Length (WanImageToVideo Node 50)
        if (workflowTemplate['50']?.inputs) {
            workflowTemplate['50'].inputs.width = finalResolution;
            workflowTemplate['50'].inputs.height = finalResolution; // Square for now
            workflowTemplate['50'].inputs.length = numFrames;
        }

        console.log('\n=== WAN 2.1 VIDEO GENERATION (Basic Workflow) ===');
        console.log('Workflow: image_to_video_wan.json');
        console.log('Model:', 'wan2.1_i2v_480p_14B_fp8_e4m3fn.safetensors (Override)');
        console.log('Resolution:', finalResolution, 'x', finalResolution);
        console.log('Frames:', numFrames);
        console.log('Seed:', finalSeed);
        console.log('===============================\n');

        // Send to ComfyUI
        const response = await fetch(`${comfyUrl}/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: workflowTemplate,
                client_id: 'wan21_client',
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
            seed: finalSeed
        });

    } catch (error: any) {
        console.error('Failed to generate video:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
