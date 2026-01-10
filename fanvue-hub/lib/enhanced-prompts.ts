// Load ALL enhanced prompts from our premium library
export async function loadEnhancedPrompts() {
    const prompts = [];

    try {
        // Load emotional scenes
        const emotionalRes = await fetch('/data/scenes/emily/emotional/scenes_enhanced.json');
        if (emotionalRes.ok) {
            const emotional = await emotionalRes.json();
            prompts.push(...emotional.map(s => ({ ...s, mood: 'emotional' })));
        }
    } catch (e) {
        console.warn('Could not load emotional scenes:', e);
    }

    try {
        // Load spicy scenes
        const spicyRes = await fetch('/data/scenes/emily/spicy/scenes_enhanced.json');
        if (spicyRes.ok) {
            const spicy = await spicyRes.json();
            prompts.push(...spicy.map(s => ({ ...s, mood: 'spicy' })));
        }
    } catch (e) {
        console.warn('Could not load spicy scenes:', e);
    }

    try {
        // Load PPV teasers
        const ppvRes = await fetch('/data/scenes/emily/ppv_teasers/scenes_enhanced.json');
        if (ppvRes.ok) {
            const ppv = await ppvRes.json();
            prompts.push(...ppv.map(s => ({ ...s, mood: 'ppv' })));
        }
    } catch (e) {
        console.warn('Could not load PPV scenes:', e);
    }

    try {
        // Load lifestyle scenes
        const lifestyleRes = await fetch('/data/scenes/emily/lifestyle/scenes.json');
        if (lifestyleRes.ok) {
            const lifestyle = await lifestyleRes.json();
            prompts.push(...lifestyle.map(s => ({ ...s, mood: 'lifestyle' })));
        }
    } catch (e) {
        console.warn('Could not load lifestyle scenes:', e);
    }

    console.log(`[Enhanced Prompts] Loaded ${prompts.length} premium scenes`);
    return prompts;
}

// Convert enhanced prompt to STORYLINE format for Emily page
export function enhancedToStoryline(enhanced) {
    return {
        id: enhanced.id,
        title: enhanced.title,
        caption: enhanced.caption,
        scene: enhanced.scene, // This is the detailed prompt
        mood: enhanced.mood,
        ppv_price: enhanced.ppv_price || null,
        quality_keywords: enhanced.quality_keywords || ''
    };
}
