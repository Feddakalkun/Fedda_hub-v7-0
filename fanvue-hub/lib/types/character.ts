// Character type definition
export interface Character {
    id: string;
    name: string;
    description: string;

    // Visual identity
    referenceImages: string[];      // URLs to reference images
    loraModel?: string;             // ComfyUI LoRA model path

    // Voice identity
    elevenLabsVoiceId?: string;    // ElevenLabs voice ID
    voiceSample?: string;          // Audio sample URL

    // Personality/Context
    personality: string;            // For Gemini content generation
    backstory?: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
}

// Service configuration types
export interface ServiceConfig {
    fanvue: {
        clientId?: string;
        connected: boolean;
    };
    comfyui: {
        apiUrl: string;
        connected: boolean;
    };
    fal: {
        apiKey?: string;
        connected: boolean;
    };
    elevenlabs: {
        apiKey?: string;
        connected: boolean;
    };
    gemini: {
        apiKey?: string;
        connected: boolean;
    };
}

// Generation job types
export interface GenerationJob {
    id: string;
    characterId: string;
    service: 'comfyui' | 'fal' | 'elevenlabs' | 'gemini';
    type: 'image' | 'video' | 'audio' | 'text';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: string;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}
