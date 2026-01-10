import { Client } from "@gradio/client";

const VOXCPM_URL = "http://localhost:7861/";

export interface VoxCPMGenerationParams {
    text: string;
    prompt_wav?: string | Blob | File | null;
    prompt_text?: string;
    cfg_value?: number;
    inference_timesteps?: number;
    do_normalize?: boolean;
    do_denoise?: boolean;
    output_format?: "wav" | "mp3" | "ogg";
}

export interface VoxCPMResponse {
    audio_url: string; // URL to the generated audio
    history: any[];
}

/**
 * Client for interacting with the local VoxCPM Text-to-Speech Engine
 */
export const voxCPM = {
    /**
     * Check if VoxCPM server is running
     */
    async isAvailable(): Promise<boolean> {
        try {
            const res = await fetch(VOXCPM_URL);
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    /**
     * Generate speech from text
     */
    async generateAudio(params: VoxCPMGenerationParams): Promise<VoxCPMResponse> {
        try {
            // Initialize Gradio client
            const client = await Client.connect(VOXCPM_URL);

            // Default values matching app.py
            const input_data = [
                params.text,                            // text
                params.prompt_wav || null,              // prompt_wav
                params.prompt_text || "",               // prompt_text
                params.cfg_value || 2.0,                // cfg_value
                params.inference_timesteps || 10,       // inference_timesteps
                params.do_normalize || false,           // DoNormalizeText
                params.do_denoise || false,             // DoDenoisePromptAudio
                params.output_format || "wav"           // output_format
            ];

            // Call the 'generate' API endpoint defined in app.py
            const result = await client.predict("/generate", input_data) as any;

            // Result is [audio_output, history_dropdown, history_state]
            // audio_output from Gradio usually comes as { name: "...", data: "...", is_file: boolean, orig_name: "..." }
            // or a direct URL depending on setup.

            const audioData = result.data[0] as any;

            if (!audioData) {
                throw new Error("No audio returned from VoxCPM");
            }

            let finalUrl = audioData.url || audioData.path || audioData; // Handle object or string

            // If it's a local file path (e.g., "outputs/..." or "C:\..."), prepending the Gradio file endpoint is needed.
            if (typeof finalUrl === 'string' && !finalUrl.startsWith('http') && !finalUrl.startsWith('data:')) {
                // Ensure absolute path logic or relative path logic works.
                // Gradio usually handles paths relative to CWD or absolute.
                // We assume VOXCPM_URL is 'http://localhost:7861/'
                // Note: Windows paths might have backslashes. replace them? Browsers handle URLs.
                // Gradio expects /file=path
                finalUrl = `${VOXCPM_URL}file=${finalUrl}`;
            }

            return {
                audio_url: finalUrl,
                history: result.data[2] as any[]
            };

        } catch (error) {
            console.error("VoxCPM Generation Error:", error);
            throw error;
        }
    }
};
