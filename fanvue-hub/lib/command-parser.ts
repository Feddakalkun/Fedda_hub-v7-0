/**
 * Parse user messages for action commands like "send me an image"
 */

export interface ParsedCommand {
    type: 'image' | 'video' | 'none';
    prompt?: string;
    originalMessage: string;
}

export function parseCommand(message: string): ParsedCommand {
    const lowerMsg = message.toLowerCase();

    // Image generation patterns
    const imagePatterns = [
        /send (?:me )?(?:a |an )?image/i,
        /send (?:me )?(?:a |an )?(?:pic|picture|photo)/i,
        /show (?:me )?(?:a |an )?(?:pic|picture|photo|image)/i,
        /generate (?:a |an )?image/i,
        /can you send/i,
        /(?:i want|i need|i'd like) (?:to see|a) (?:pic|picture|photo|image)/i
    ];

    for (const pattern of imagePatterns) {
        if (pattern.test(lowerMsg)) {
            // Extract what kind of image they want
            let prompt = extractImagePrompt(message);

            return {
                type: 'image',
                prompt: prompt || 'sexy selfie',
                originalMessage: message
            };
        }
    }

    return {
        type: 'none',
        originalMessage: message
    };
}

function extractImagePrompt(message: string): string | undefined {
    // Try to extract description after "of"
    const ofMatch = message.match(/(?:image|pic|picture|photo)\s+of\s+(.+)/i);
    if (ofMatch) return ofMatch[1].trim();

    // Try to extract description with "wearing" or "in"
    const wearingMatch = message.match(/(?:wearing|in)\s+(.+)/i);
    if (wearingMatch) return wearingMatch[1].trim();

    // Default: return undefined (will use character default)
    return undefined;
}
