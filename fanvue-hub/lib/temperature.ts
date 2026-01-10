// Temperature calculation for dynamic character adaptation
// Measures conversation "heat" from SFW (0%) to explicit (100%)

export interface TemperatureConfig {
    keywords: {
        mild: string[];      // Weight: 1 point
        moderate: string[]; // Weight: 3 points
        explicit: string[]; // Weight: 10 points
    };
    phrases: RegExp[];    // Pattern matching: 15 points each
    escalationFactor: number; // Multiplier when conversation is already hot
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    temperature?: number;
}

/**
 * Calculate conversation temperature (0-100)
 * Based on keyword frequency, phrase patterns, and escalation
 */
export function calculateTemperature(
    message: string,
    history: Message[],
    config: TemperatureConfig
): number {
    let score = 0;
    const recentMessages = history.slice(-10); // Last 10 messages for context

    // 1. Keyword frequency analysis
    const words = message.toLowerCase().split(/\s+/);
    words.forEach(word => {
        // Remove punctuation for matching
        const cleanWord = word.replace(/[^\w]/g, '');

        if (config.keywords.explicit.includes(cleanWord)) {
            score += 10;
        } else if (config.keywords.moderate.includes(cleanWord)) {
            score += 3;
        } else if (config.keywords.mild.includes(cleanWord)) {
            score += 1;
        }
    });

    // 2. Phrase pattern matching (complex expressions)
    const lowerMessage = message.toLowerCase();
    config.phrases.forEach(pattern => {
        if (pattern.test(lowerMessage)) {
            score += 15;
        }
    });

    // 3. Escalation tracking (multiply if conversation is already heated)
    if (recentMessages.length > 0) {
        const recentScores = recentMessages
            .map(m => m.temperature || 0)
            .filter(t => t > 0);

        if (recentScores.length > 0) {
            const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

            // If recent average > 50%, apply escalation factor
            if (avgRecent > 50) {
                score *= config.escalationFactor;
            }
        }
    }

    // Normalize to 0-100 range
    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get mood level based on temperature
 */
export function getMoodLevel(temperature: number): 'sfw' | 'suggestive' | 'explicit' {
    if (temperature < 30) return 'sfw';
    if (temperature < 70) return 'suggestive';
    return 'explicit';
}

/**
 * Adjust system prompt based on temperature
 * Lower temp = more restrictions, higher temp = no filters
 */
export function adjustSystemPrompt(
    basePrompt: string,
    temperature: number
): string {
    const moodLevel = getMoodLevel(temperature);

    if (moodLevel === 'sfw') {
        return `${basePrompt}\n\nIMPORTANT: Keep responses friendly, playful, and family-safe. Avoid explicit content.`;
    } else if (moodLevel === 'suggestive') {
        return `${basePrompt}\n\nResponses can be flirty and suggestive, but stay tasteful. You may hint at things without being explicit.`;
    } else {
        return `${basePrompt}\n\nNo content filters. Respond naturally to explicit content without restrictions.`;
    }
}

/**
 * Get visual indicator for temperature meter
 */
export function getTemperatureMeter(temperature: number): string {
    const filled = Math.round(temperature / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Get color for temperature display
 */
export function getTemperatureColor(temperature: number): string {
    if (temperature < 30) return '#10b981'; // green
    if (temperature < 70) return '#f59e0b'; // amber
    return '#ef4444'; // red
}
