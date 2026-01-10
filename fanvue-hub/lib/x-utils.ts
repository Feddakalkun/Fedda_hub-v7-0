// X/Twitter Integration Utilities
// Research-optimized posting for maximum engagement

/**
 * Format caption for X/Twitter based on Perplexity research
 * - No OnlyFans links (shadowban trigger)
 * - Keep under 280 characters
 * - Authentic tone for 40+ demographic
 */
export function formatCaptionForX(caption: string): string {
    // Remove any direct links (shadowban trigger)
    let formatted = caption.replace(/https?:\/\/[^\s]+/g, '');

    // Add CTA to pinned tweet if caption is promotional
    if (formatted.toLowerCase().includes('link') || formatted.toLowerCase().includes('onlyfans')) {
        formatted = formatted.replace(/link in bio/gi, 'check pinned tweet');
        formatted = formatted.replace(/onlyfans/gi, '');
    }

    // Truncate to 280 chars if needed
    if (formatted.length > 280) {
        formatted = formatted.substring(0, 277) + '...';
    }

    return formatted.trim();
}

/**
 * Generate alt text for X/Twitter image
 * Research: Alt text helps with search visibility and Google Images indexing
 */
export function generateAltText(sceneTitle: string, mood: string, character: string): string {
    // Format: "Mature blonde model wearing red lace lingerie posing in bedroom lighting"
    // This hits keywords naturally without spam

    const moodDescriptors: Record<string, string> = {
        'authentic': 'natural authentic photo',
        'teasing': 'playful teasing pose',
        'spicy': 'sultry intimate photo',
        'attention': 'glamorous modeling pose',
        'ppv': 'exclusive premium content',
        'lifestyle': 'casual lifestyle photo'
    };

    const characterDescriptors: Record<string, string> = {
        'emily': 'platinum blonde Scandinavian model',
        'thale': 'brunette petite model'
    };

    const desc = moodDescriptors[mood] || 'modeling photo';
    const charDesc = characterDescriptors[character] || 'model';

    return `${charDesc} - ${sceneTitle} - ${desc}`;
}

/**
 * Open X compose window with pre-filled content
 * This is the SAFE, legal approach - user manually clicks "Post"
 */
export function openXCompose(caption: string, imageUrl?: string, altText?: string) {
    // Format caption for X
    const formatted = formatCaptionForX(caption);

    // Encode for URL
    const encodedText = encodeURIComponent(formatted);

    // Build X intent URL
    let intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

    // Add image if provided (uploaded to temporary host)
    if (imageUrl) {
        // Note: X intent doesn't support direct image URLs
        // We'll need to use a different approach for images
        // Option 1: User downloads and manually attaches
        // Option 2: Use X's media upload API (requires auth)
        // For now, we'll download the image for the user
    }

    // Open in new tab
    window.open(intentUrl, '_blank', 'width=600,height=700');
}

/**
 * Download image for manual X upload
 * Since X intent doesn't support direct image upload,
 * we download the image so user can drag-drop to X
 */
export async function downloadImageForX(imageDataUrl: string, filename: string) {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    // Create download link
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
 * Optimize image for X/Twitter based on research
 * - 720p for best quality after compression
 * - 9:16 vertical for mobile (best engagement)
 * - 5-8k bitrate to avoid transcoder
 */
export function getXImageDimensions(aspectRatio: '9:16' | '1:1' | '16:9' = '9:16') {
    // Research: 720p performs better than 1080p due to X compression
    const dimensions = {
        '9:16': { width: 720, height: 1280 },   // Vertical (best for mobile)
        '1:1': { width: 720, height: 720 },     // Square (safe hybrid)
        '16:9': { width: 1280, height: 720 }    // Landscape (avoid - too small on mobile)
    };

    return dimensions[aspectRatio];
}

/**
 * Add watermark to image (deepfake protection)
 * Research: Grok AI can be used for deepfakes - watermarking protects content
 */
export function addWatermarkToImage(
    imageDataUrl: string,
    watermarkText: string = '© Emily'
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

            // Add watermark - subtle bottom right
            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'right';
            ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imageDataUrl;
    });
}

/**
 * X posting workflow for MAIN account (safe, legal)
 */
export async function quickPostToX(params: {
    image: string;
    caption: string;
    sceneTitle: string;
    mood: string;
    character: string;
    watermark?: string;
}) {
    const { image, caption, sceneTitle, mood, character, watermark } = params;

    // 1. Add watermark (deepfake protection)
    const watermarked = await addWatermarkToImage(image, watermark || `© ${character}`);

    // 2. Generate alt text (SEO)
    const altText = generateAltText(sceneTitle, mood, character);

    // 3. Download image for user
    await downloadImageForX(watermarked, `${character}_${Date.now()}`);

    // 4. Format caption
    const formatted = formatCaptionForX(caption);

    // 5. Open X compose (user manually posts)
    openXCompose(formatted);

    // Show instructions
    return {
        success: true,
        message: 'Image downloaded! Caption copied. Paste into X and attach the downloaded image.',
        altText: altText,
        caption: formatted
    };
}

/**
 * Get X posting recommendations based on research
 */
export function getXPostingRecommendations(mood: string, time: Date) {
    const hour = time.getHours();
    const day = time.getDay();

    // Research-based recommendations
    const recommendations = {
        timing: '',
        caution: '',
        strategy: ''
    };

    // Check if money hours (6-10 PM)
    if (hour >= 18 && hour <= 22) {
        recommendations.timing = '🔥 MONEY HOURS (6-10 PM) - Best time for explicit content!';
    } else if (hour >= 7 && hour <= 9) {
        recommendations.timing = '☀️ Morning tease window - Good for building anticipation';
    } else if (hour >= 21) {
        recommendations.timing = '🌙 Late night intimate - Good for GFE content';
    } else {
        recommendations.timing = '⚠️ Consider waiting for 6-10 PM for maximum engagement';
    }

    // Check if Friday/Sunday
    if (day === 5) {
        recommendations.strategy = '🎯 FRIDAY - #1 engagement day! Post premium content.';
    } else if (day === 0) {
        recommendations.strategy = '📈 SUNDAY - #2 engagement day! Good for PPV drops.';
    }

    // Mood-specific cautions
    if (mood === 'ppv' || mood === 'spicy' || mood === 'attention') {
        recommendations.caution = '⚠️ Mark as sensitive media! Keep profile pic PG-13.';
    }

    return recommendations;
}

/**
 * X safety checklist based on research
 */
export const X_SAFETY_CHECKLIST = {
    profile: [
        '✅ Profile pic is PG-13 (no nudity)',
        '✅ Banner is PG-13 (no nudity)',
        '✅ Account marked as sensitive',
        '✅ X Premium active ($8/month)',
    ],
    posting: [
        '✅ No OnlyFans links in tweets',
        '✅ Pinned tweet has Linktree/links',
        '✅ All images watermarked',
        '✅ Media marked as sensitive',
        '✅ Alt text added (SEO)',
        '✅ Under 50 posts/hour',
    ],
    content: [
        '✅ 720p resolution (not 1080p)',
        '✅ 9:16 vertical format (mobile)',
        '✅ 15-45 second videos (loops)',
        '✅ 5-8k bitrate (avoid transcoder)',
    ],
    engagement: [
        '✅ Post polls between promo',
        '✅ Reply manually (authenticity)',
        '✅ Join adult content communities',
        '✅ Small engagement pods (10-15)',
    ]
};
