import fal from '@fal-ai/client';

// Lazy initialization
let configured = false;
function ensureConfigured() {
    if (!configured) {
        const apiKey = process.env.FAL_API_KEY;
        if (apiKey) {
            fal.config({
                credentials: apiKey,
            });
            configured = true;
        }
    }
}

export type FalImageResult = {
    images: Array<{
        url: string;
        width: number;
        height: number;
        content_type: string;
    }>;
    timings?: Record<string, number>;
    seed?: number;
    has_nsfw_concepts?: boolean[];
    prompt?: string;
};

export class FalClient {
    /**
     * Generate ultra-realistic character using FLUX Pro
     */
    async generateCharacter(params: {
        prompt: string;
        aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
        numImages?: number;
        seed?: number;
    }): Promise<FalImageResult> {
        ensureConfigured();

        const {
            prompt,
            aspectRatio = '9:16', // Default to Fanvue-friendly portrait
            numImages = 1,
            seed,
        } = params;

        const result = await fal.subscribe<FalImageResult>(
            'fal-ai/flux-pro/v1.1-ultra',
            {
                input: {
                    prompt,
                    num_images: numImages,
                    aspect_ratio: aspectRatio,
                    output_format: 'png',
                    safety_tolerance: '2', // Allow more creative freedom
                    ...(seed && { seed }),
                },
            }
        );

        return result;
    }

    /**
     * Refine character with reference image (for consistency)
     */
    async refineWithReference(params: {
        prompt: string;
        referenceImageUrl: string;
        strength?: number; // 0-1, how much to change
        aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    }): Promise<FalImageResult> {
        ensureConfigured();

        const {
            prompt,
            referenceImageUrl,
            strength = 0.5,
            aspectRatio = '9:16',
        } = params;

        const result = await fal.subscribe<FalImageResult>(
            'fal-ai/flux-pro/v1.1-ultra/redux',
            {
                input: {
                    prompt,
                    image_url: referenceImageUrl,
                    strength,
                    aspect_ratio: aspectRatio,
                    output_format: 'png',
                    safety_tolerance: '2',
                },
            }
        );

        return result;
    }

    /**
     * Download image from Fal URL to Buffer (for ComfyUI)
     */
    async downloadImage(url: string): Promise<Buffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Batch generate multiple variations
     */
    async batchGenerate(params: {
        prompts: string[];
        aspectRatio?: string;
    }): Promise<FalImageResult[]> {
        ensureConfigured();

        const results: FalImageResult[] = [];

        for (const prompt of params.prompts) {
            const result = await this.generateCharacter({
                prompt,
                aspectRatio: params.aspectRatio as any,
            });
            results.push(result);
        }

        return results;
    }
}

export const falClient = new FalClient();
