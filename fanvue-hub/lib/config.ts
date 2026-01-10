// Configuration loader - reads from environment variables
// This allows users to customize their character without touching code

import { CHARACTER_TAGS } from './shared-scenes';

export const CHARACTER_CONFIG = {
    name: process.env.NEXT_PUBLIC_CHARACTER_NAME || 'Emily ✨',
    handle: process.env.NEXT_PUBLIC_CHARACTER_HANDLE || '@emily_from_north',
    bio: process.env.NEXT_PUBLIC_CHARACTER_BIO || 'Full-time fantasy, part-time reality. Denmark-based digital dream. 21 & always online 💕',
    age: parseInt(process.env.NEXT_PUBLIC_CHARACTER_AGE || '21'),
    location: process.env.NEXT_PUBLIC_CHARACTER_LOCATION || 'Denmark',
    // Use character tag instead of full appearance
    characterTag: 'emily' as keyof typeof CHARACTER_TAGS,
    appearance: CHARACTER_TAGS.emily,
    lora: process.env.CHARACTER_LORA || 'Emmy.safetensors', // Updated to match asset
    themes: [] as Array<{ name: string, desc: string, icon: string }>, // Populated in component
}

export const COMFYUI_CONFIG = {
    url: process.env.COMFYUI_URL || 'http://localhost:8188',
}

// Export for backward compatibility with existing EMILY constant
export const EMILY = CHARACTER_CONFIG
