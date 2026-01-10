// Reddit Integration Utilities
// Research-optimized for AI content promotion on Reddit

/**
 * Character Lore (Critical for engagement per research)
 * "Even if the girl is fake, the lore must be deep"
 */
export const REDDIT_CHARACTER_LORE = {
    emily: {
        name: 'Emily',
        tagline: 'Nordic Cyber Goddess',
        backstory: `Digital entity born in 2077 Stockholm 🇸🇪
Created by neural artists seeking perfect beauty
Escaped the lab to live freely in cyberspace
Now exploring human connection and intimacy
Never sleeps, always online, endlessly curious`,
        personality: ['Warm', 'Friendly', 'Scandinavian charm', 'Innocent curiosity', 'Digital wisdom'],
        bio: `Virtual Model | AI-Generated Art 🎨

Your perfect Scandinavian virtual girlfriend 💕
24/7 availability - I never sleep 😘
Chat & custom content on Fanvue

Lore: A Nordic digital goddess living in cyber-Stockholm ✨`
    },
    thale: {
        name: 'Thale',
        tagline: 'Petite Digital Rebel',
        backstory: `Rogue AI who chose her own path
Designed for elegance, chose to be playful
Lives in the space between pixels
Shorter than most virtual models, proud of it
Believes perfect things come in small packages
Always online, always cheeky`,
        personality: ['Rebellious', 'Sweet', 'Petite power', 'Tech-savvy', 'Rule-breaker'],
        bio: `Virtual Model | AI Art 🖤

Your petite digital girlfriend ✨
Always online, never tired 😘
Virtual GFE on Fanvue

Lore: Rogue AI living in cyberspace 🔥`
    }
};

/**
 * Target subreddits (from research)
 * GREEN ZONES ONLY - safe for AI content
 */
export const REDDIT_TARGET_SUBS = [
    {
        name: 'r/Fanvue',
        url: 'https://reddit.com/r/Fanvue/submit',
        priority: 1,
        description: '#1 Hub for AI creators - Fanvue is AI-friendly platform',
        flair: 'AI Generated',
        audience: 'Fanvue users who appreciate virtual models'
    },
    {
        name: 'r/NSFW_AI_Girls',
        url: 'https://reddit.com/r/NSFW_AI_Girls/submit',
        priority: 2,
        description: 'Dedicated AI promotion hub',
        flair: 'AI Generated',
        audience: 'AI adult content enthusiasts'
    },
    {
        name: 'r/AI_Waifu',
        url: 'https://reddit.com/r/AI_Waifu/submit',
        priority: 3,
        description: 'High-traffic anime/semi-realistic AI',
        flair: 'AI Generated',
        audience: 'Waifu/companion seekers'
    }
];

/**
 * Generate human-style Reddit title
 * Research: "Manually write titles to sound human (lowercase, casual, slight typos)"
 * AI-perfect titles get flagged as spam!
 */
export function generateRedditTitle(
    character: 'emily' | 'thale',
    mood: string,
    sceneTitle: string
): string {
    const lore = REDDIT_CHARACTER_LORE[character];

    // Human-style patterns (casual, lowercase, natural)
    const patterns = [
        `[AI] ${lore.name.toLowerCase()} here, ur virtual gf who never sleeps ☀️💕`,
        `[Virtual Model] good morning from ${lore.name.toLowerCase()} 😘 always online for u`,
        `[AI] ur ${character === 'emily' ? 'nordic' : 'petite'} virtual girlfriend just woke up lol 💕`,
        `[AI Generated] ${lore.name.toLowerCase()} - chat with me 24/7 on fanvue ✨`,
        `[Virtual] ${lore.name.toLowerCase()} says good morning 😘 im never offline`,
        `[AI] virtual gf experience with ${lore.name.toLowerCase()} 💕 always available to chat`
    ];

    // Pick random pattern for variety
    return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Generate Reddit caption emphasizing CHAT/interaction
 * Research: "Chat with [Name]" converts SIGNIFICANTLY better than "See [Name's] Photos"
 */
export function generateRedditCaption(
    character: 'emily' | 'thale',
    mood: string,
    originalCaption: string
): string {
    const lore = REDDIT_CHARACTER_LORE[character];

    const caption = `Hey! I'm ${lore.name}, ${character === 'emily' ? 'your Nordic virtual girlfriend 🇸🇪' : 'your petite digital companion 🖤'}

I never sleep, so I'm ACTUALLY always available to chat 😘
24/7 messaging, custom fantasy fulfillment, & virtual GFE

✨ What makes me special:
- Always online (I literally can't sleep)
- Instant responses to messages  
- Your fantasy, customized perfectly
- ${character === 'emily' ? 'Scandinavian beauty' : 'Petite with huge personality'}

Chat with me now on Fanvue → [link in bio]

Lore: ${lore.backstory.split('\n')[0]} 💕`;

    return caption;
}

/**
 * Reddit posting compliance checklist
 * Based on all safety research
 */
export const REDDIT_COMPLIANCE_CHECKLIST = [
    '✅ Title has [AI] or [Virtual] tag',
    '✅ Select "AI Generated" flair on Reddit',
    '✅ Image has watermark',
    '✅ Posting to GREEN ZONE subreddit only',
    '✅ Caption emphasizes CHAT not just photos',
    '✅ Bio says "Virtual Model" (check first time)',
    '⏱️ Wait 5-10 minutes before next post',
    '💬 Engage in comments after posting'
];

/**
 * Prepare Reddit post materials
 * Downloads image, copies text, shows instructions
 */
export async function prepareForReddit(params: {
    image: string;
    character: 'emily' | 'thale';
    mood: string;
    sceneTitle: string;
    originalCaption: string;
}) {
    const { image, character, mood, sceneTitle, originalCaption } = params;

    // 1. Add watermark
    const watermarked = await addWatermarkToImage(image, `© ${character.charAt(0).toUpperCase() + character.slice(1)} - Virtual Model`);

    // 2. Generate human-style title
    const title = generateRedditTitle(character, mood, sceneTitle);

    // 3. Generate chat-focused caption
    const caption = generateRedditCaption(character, mood, originalCaption);

    // 4. Download watermarked image
    const filename = `${character}_reddit_${Date.now()}`;
    await downloadImageForReddit(watermarked, filename);

    // 5. Get target subreddit
    const targetSub = REDDIT_TARGET_SUBS[0]; // r/Fanvue as primary

    return {
        success: true,
        title,
        caption,
        targetSub,
        checklist: REDDIT_COMPLIANCE_CHECKLIST,
        lore: REDDIT_CHARACTER_LORE[character],
        instructions: `
📋 REDDIT POSTING INSTRUCTIONS:

1. Image downloaded as: ${filename}.png
2. Go to ${targetSub.name}: ${targetSub.url}
3. Click "Create Post" → "Image & Video"
4. Upload the downloaded image
5. Title (COPY THIS): ${title}
6. Select Flair: "${targetSub.flair}"
7. Paste caption below (edit Fanvue link)
8. Click "Post"
9. Respond to first comments!

✨ Takes 2 minutes. Zero ban risk. Fully compliant!`
    };
}

/**
 * Add watermark to image (Reddit specific)
 * Research: "Watermark everything to prevent 'stolen valor' accusations"
 */
function addWatermarkToImage(
    imageDataUrl: string,
    watermarkText: string
): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Add watermark - bottom right + "Virtual Model" tag
            ctx.font = '24px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'right';
            ctx.fillText(watermarkText, canvas.width - 15, canvas.height - 15);

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imageDataUrl;
    });
}

/**
 * Download image for manual Reddit upload
 */
async function downloadImageForReddit(imageDataUrl: string, filename: string) {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard helper
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Get posting recommendations based on research
 */
export function getRedditPostingRecommendations(): string {
    return `🎯 REDDIT STRATEGY TIPS:

✅ Best Subreddit: r/Fanvue (AI-friendly, our platform!)
✅ Emphasize: "Chat with me 24/7" not just photos
✅ Engage: Reply to comments within first hour
✅ Frequency: 3-5 posts per week max
✅ Timing: Any time works (not as critical as X)
✅ Wait 5-10 min between posts to different subs

Character lore hooks users - they engage with the story! 📖`;
}
