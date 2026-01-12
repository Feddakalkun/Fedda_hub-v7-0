'use client';

import { useState } from 'react';
import { useComfyProgress } from '@/hooks/useComfyProgress';

interface ImageGeneratorProps {
    characterSlug: string;
    characterName: string;
    loraPath?: string;
    appearance?: string;
    generatedImages: string[];
    setGeneratedImages: (images: string[] | ((prev: string[]) => string[])) => void;
}

export default function ImageGenerator({
    characterSlug,
    characterName,
    loraPath,
    appearance,
    generatedImages,
    setGeneratedImages
}: ImageGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('ugly, deformed, blurry, low quality');
    const [numImages, setNumImages] = useState(1);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1'); // Default to square

    const { state: progressState, startMonitoring, reset: resetProgress } = useComfyProgress();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert('Please enter a prompt');
            return;
        }

        if (!loraPath) {
            alert('No LoRA configured for this character. Please set it in Settings.');
            return;
        }

        try {
            // Start generation
            const res = await fetch(`/api/comfyui/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterSlug,
                    prompt: `${appearance ? appearance + ', ' : ''}${prompt}, hyper-realistic 8K portrait, natural skin texture with visible pores and fine micro-details, subtle peach-fuzz, realistic subsurface scattering, professional studio lighting, shallow depth of field, razor-sharp eyes, anatomically correct face and body, cinematic editorial photography`,
                    negativePrompt: `${negativePrompt}, no plastic skin, no beauty filters, no over-smooth retouching, no deformed face, no bad anatomy, no extra fingers, no asymmetrical eyes, no cross-eyed gaze, no watermark, no text, no logo, no low-res, no blur`,
                    numImages,
                    loraPath,
                    aspectRatio,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                alert('Failed to start generation: ' + data.error);
                return;
            }

            // Start monitoring
            startMonitoring(data.promptId);

            // Poll for completion
            pollForCompletion(data.promptId);

        } catch (e) {
            console.error('Generation error:', e);
            alert('Failed to generate images');
        }
    };

    const pollForCompletion = async (promptId: string) => {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/comfyui/status/${promptId}`);
                const data = await res.json();

                if (data.status === 'done' && data.images && data.images.length > 0) {
                    setGeneratedImages(prev => [...data.images, ...prev]);
                    resetProgress();

                    // Clear ComfyUI memory after image generation
                    console.log('🧹 Clearing GPU memory after image generation...');
                    try {
                        await fetch('/api/comfyui/free-memory', { method: 'POST' });
                    } catch (e) {
                        console.warn('Memory clear failed (non-critical)');
                    }

                    return true;
                }

                if (data.status === 'error') {
                    alert('Generation failed: ' + data.error);
                    resetProgress();
                    return true;
                }

                // Continue polling
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 5000);
                } else {
                    alert('Generation timed out');
                    resetProgress();
                }

            } catch (e) {
                console.error('Polling error:', e);
                resetProgress();
            }
        };

        setTimeout(checkStatus, 5000);
    };

    const [isPosting, setIsPosting] = useState<string | null>(null);

    const handlePostToFanvue = async (imageUrl: string) => {
        // Generate natural viral caption from SOME guide strategies
        const captions = [
            // FOMO & Urgency Tactics
            "Just vibing ✨",
            "Caught this moment just for you… 💕",
            "This is just the beginning. Want to see what happens next? 👀",
            "Too hot for the feed 🔥",
            "First 10 subscribers get something special 🎁",
            "24 hours only... don't miss out ⏰",

            // Relatable & Engaging
            "Feeling cute today 💕",
            "New post for you 😊",
            "Hey loves! 💖",
            "Mood 💫",
            "Good vibes only ✌️",
            "Living my best life 🌟",
            "Hope you enjoy this one 😘",
            "Sweet moments 🍃",
            "Just me being me 💁‍♀️",

            // Trendy & Bold
            "Enjoying my day ☀️",
            "For my favorites 💝",
            "Catching some sun ☀️",
            "Felt cute, might delete later 🙈",
            "New content alert! 🔔",
            "Serving looks, not apologies ✨",
            "2025 energy: unstoppable 💫",
            "Currently vibing at peak aesthetic 📸",

            // Curiosity Gaps
            "Wait for it... 👀",
            "More where this came from 💕",
            "This is what happens when... 😏",
            "You won't believe what's next 🤫",
            "Part 2 is too much for here... 👉",

            // Direct / Conversion
            "Want exclusive access? Link in bio 🔗",
            "This is just a preview 😉",
            "More on my VIP page 💎",
            "Already subscribed? Comment your fav! 💖",

            // Engagement Questions
            "What would you like to see next?💭",
            "This or that? Let me know! 🤔",
            "Comment if you're still awake 👇",
            "Tag someone who needs this 🏷️",
            "Double tap if you agree 💕",

            // Season/Trend Specific  
            "Making memories ✨",
            "Golden hour hits different 🌅",
            "Cozy season vibes 🍂",
            "New year, new content 🎆",
            "Weekend mood activated 🌟"
        ];
        const randomCaption = captions[Math.floor(Math.random() * captions.length)];

        if (!confirm(`Post this image to Fanvue with caption: "${randomCaption}"?`)) return;

        setIsPosting(imageUrl);
        try {
            const res = await fetch(`/api/characters/${characterSlug}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl,
                    caption: randomCaption,
                    isSubscriberOnly: false
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Success! Image posted to Fanvue.');
            } else {
                alert('Failed to post: ' + data.error);
            }
        } catch (e) {
            alert('Failed to post to Fanvue');
        } finally {
            setIsPosting(null);
        }
    };

    const handleSaveToLibrary = async (imageUrl: string) => {
        try {
            const res = await fetch(`/api/characters/${characterSlug}/save-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Image saved to library!');
            } else {
                alert('Failed to save: ' + data.error);
            }
        } catch (e) {
            alert('Failed to save image');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
            {/* Left Panel - Controls */}
            <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                        🎨 Text to Image Generator
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                        Generate images for {characterName} using ComfyUI
                    </p>
                </div>

                {/* Prompt */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px', color: '#ccc', fontWeight: '600' }}>
                        Prompt
                    </label>

                    {/* Presets Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)', // 3 cols for tiktok variants
                        gap: '8px',
                        marginBottom: '16px'
                    }}>
                        {[
                            // CINEMATIC PORTRAITS
                            { name: '⚡ Geometric Glow', prompt: 'Ultra-realistic portrait wearing dark navy oversized streetwear t-shirt with glowing blue geometric pattern at center. Black sunglasses, silver chain necklace. Standing against clean gradient background transitioning from deep navy to sky blue. Shallow depth of field, studio lighting, 12K resolution, cinematic editorial fashion shoot style. Sharp focus on face and eyes.' },
                            { name: '🔥 Fire Noir', prompt: 'Person standing against black background holding newspaper labeled LATEST NEWS with blue flames at one corner and faint smoke trail. Moody cinematic lighting from blue fire, casting blue highlights and shadows across face and hands. Black shirt with layered silver chains. Serious, contemplative expression. Intense mysterious atmosphere. Ultra-realistic.' },
                            { name: '☀️ Golden Spotlight', prompt: 'Dramatic studio portrait with soft golden spotlight creating large circle on deep navy background. Subject standing slightly off-center with clear shadow to right. Plain black t-shirt, slightly long wavy hair, flawless fair skin. Top-left lighting casting sharp shadows. 4:3 aspect ratio, editorial portrait style, cinema lighting.' },
                            { name: '💨 Dual Smoke', prompt: 'Well-groomed person wearing dark velvet suit and sunglasses in moody studio setting. Background dramatically split with blue smoke on left and red smoke on right, creating high-contrast cinematic atmosphere. Multiple rings on fingers, luxury watch on wrist. Dramatic lighting highlighting facial contours. Ultra-realistic, 8K quality.' },
                            { name: '💧 Water Reflection', prompt: 'Close-up portrait with only half of face visible and partially submerged in water. Illuminated with soft ambient blue and pink neon lighting casting colorful reflections on wet skin and damp hair. Water droplets and bubbles cling to face. Intense eye focus, cinematic mood, sharp focus on facial details.' },

                            // NEO-NOIR / MOODY
                            { name: '🚗 Neon Car', prompt: 'Sitting inside car at night bathed in moody neon blue and magenta lighting. Atmosphere is intense and mysterious with deep blue and magenta hues illuminating interior. Rain droplets streaking car window. Neo-noir thriller vibe with high contrast lighting. Person grips steering wheel with serious expression, face partially shadowed. Ultra-realistic, 4:3 ratio.' },
                            { name: '🌃 Street Noir', prompt: 'Cinematic night-time shot of person standing in middle of dark empty street under single streetlight. Wearing long dark trench coat, looking serious and mysterious. Fog surrounding background with soft light illuminating parts of face. Car headlights visible far in background. Moody blue color grading, film noir style, 35mm film grain, dramatic shadows. 9:16 ratio.' },
                            { name: '🔴 Red Gradient', prompt: 'Standing against bold red gradient background, confident pose. Dramatic cinematic lighting emphasizing facial structure. Luxury fashion magazine vibe. Ultra-realistic, high-detail, editorial photography style, 4K resolution, symmetrical composition, minimal background elements. 4:3 ratio.' },
                            { name: '🚇 Metro Blur', prompt: 'Slow-motion cinematic side profile shot of person walking against rushing metro station crowd. All others blurred with motion trails. Person in focus with serious face, wearing long trench coat. Cool blue tones, 35mm film look, ambient lighting from train signs. Portrait 4:3 ratio.' },
                            { name: '👥 City Rush', prompt: 'Cinematic overhead shot of person standing still on brick city sidewalk wearing dark oversized blazer. Motion-blurred crowd rushing past around them. Moody lighting, 35mm film look, shallow depth of field, sharp focus. Portrait 4:3 ratio, ultra-realistic.' },

                            // AESTHETIC LIFESTYLE
                            { name: '☔ Rain Walk', prompt: 'Person wearing oversized black t-shirt and black box pants with sneakers, holding umbrella on sidewalk about to cross road at red light. Many trees beside sidewalk, heavy rain. Vertical 9:16 format. Moody aesthetic with rain droplets visible. Cinematic color grading.' },
                            { name: '🌅 GRWM Golden', prompt: 'Getting ready montage aesthetic. Person in mirror applying makeup or adjusting outfit, morning sunlight streaming through window. Soft golden hour lighting, warm tones. Minimal background with clean aesthetic. 9:16 vertical format perfect for reels. Cinematic color grading, shallow depth of field.' },
                            { name: '👗 Outfit Montage', prompt: 'Bedroom setup montage showing outfit transitions from casual to dressed up. Soft ambient lighting, neutral tones with pops of color. Clean minimalist aesthetic with plants and tasteful decoration visible. 9:16 vertical format. High quality lifestyle photography.' },
                            { name: '☕ Morning Routine', prompt: 'Morning or night routine sequence shown in 3-4 separate frames within one image. Morning coffee moment, skincare routine, getting dressed. Soft warm lighting, aesthetic minimalist home decor. Clean white and neutral tones. Cinematic feel, editorial quality.' },
                            { name: '📖 Cozy Workspace', prompt: 'Workspace or bedroom aesthetic shot. Cozy lighting with warm golden hour glow. Plants, books, aesthetic decor arranged beautifully. Person visible working or sitting. Shallow depth of field. 4:3 ratio. Highly photogenic and Instagrammable aesthetic.' },

                            // FASHION / STYLE
                            { name: '📱 Fisheye Fun', prompt: 'Ultra-realistic vertical format fisheye selfie with exaggerated silly faces, bright living room with white tones, high camera angle. Extreme fisheye distortion. Realistic cinematic lighting. 9:16 format.' },
                            { name: '👟 Streetwear Shot', prompt: 'Full-body fashion shot of person in trendy streetwear - oversized designer hoodie, baggy cargo pants, pristine sneakers. Standing in urban setting with interesting architecture background. Bright natural lighting, sharp focus on outfit details. Fashion editorial quality. 9:16 vertical.' },
                            { name: '🏎️ Car Lean', prompt: 'Person leaning casually against customized car in busy city street with motion-blurred crowd rushing past. Person in focus wearing fashionable streetwear. Moody cinematic lighting. Street racing aesthetic inspired by Need for Speed. 4:3 ratio.' },
                            { name: '👜 Fashion Flatlay', prompt: 'Fashion flat-lay aesthetic showing outfit pieces arranged artistically - designer shoes, sunglasses, jewelry, luxury watch, fashionable clothing items. Soft natural lighting, white background. Perfect for carousel posts. Ultra-realistic product photography quality.' },
                            { name: '🎀 Y2K Aesthetic', prompt: 'Person wearing trendy Y2K aesthetic outfit - colorful oversized clothing, chunky accessories, retro sunglasses. Posed confidently against minimalist background. Bright colors popping against neutral background. Fashion editorial quality, 4:3 ratio.' },

                            // COLOR GRADING TRENDS
                            { name: '🎨 Teal Orange', prompt: 'Teal and orange magazine glow cinematic portrait. High-contrast teal and orange color grading. Electric teal tones in shadows, sunset orange highlights on skin with layered light flares. Polished color grading. Smooth skin texture but preserve realistic pores. Wide aperture, shallow depth of field blurring background into creamy rich color. Ultra-polished editorial spread quality. 4:3 ratio.' },
                            { name: '🔥 Red Teal Drama', prompt: 'Red teal contrast drama portrait. Bold dramatic red and teal cinematic contrast look. Warm red tones hitting one side of face, cool teal shadows sculpting other side. Deep saturation, high contrast, glossy finish. Crisp edges and dramatic color storytelling. Ultra-realistic, 8K quality.' },
                            { name: '🌇 Golden Hour', prompt: 'Warm golden-hour portrait with soft sunlight casting dramatic shadows on plain wall. Slightly wavy medium-length hair. Calm introspective expression. Strong shadow visible on wall. Golden and warm tones throughout. 4:3 ratio. Cinematic tone matching classic editorial photography.' },
                            { name: '🎞️ Vintage Orange', prompt: 'Orange-yellow moody tones with soft glow and slightly vintage film-like filter. Background shows tiled subway wall with old advertisement. 90s nostalgic vibe with modern editorial twist. Realistic proportions, accurate facial features. Warm aesthetic color grading. 4:3 ratio.' },
                            { name: '💜 Neon Future', prompt: 'Hyper-bright neon aesthetic with electric blue, hot pink, and purple gradients. AI-generated aesthetic with digital metaverse vibes. Futuristic color palette. High contrast colors, glossy finish. Modern streetwear in frame. Ultra-realistic with fantastical color treatment. 9:16 vertical format.' },

                            // POV & ENGAGEMENT
                            { name: '🎭 Anime Collab', prompt: 'Ultra-realistic 9:16 vertical fisheye selfie with anime character. Both making silly exaggerated faces. Bright living room with white tones. High camera angle, extreme fisheye distortion. Realistic cinematic lighting, anime characters integrated with stylized realism.' },
                            { name: '🌆 Double Exposure', prompt: 'Double exposure portrait in profile with post-apocalyptic cityscape inside silhouette. Inner scene shows person walking through destroyed urban street, buildings in ruins, glowing embers, fire, dramatic sunset background. Moody lighting, warm tones, emotional introspective mood. High detail, 8K resolution.' },
                            { name: '👯 Thriller Duo', prompt: 'Cinematic double profile shot with two people shoulder-to-shoulder in serious poses. Moody evening lighting, dramatic atmosphere. Empty street background. Matching aesthetic and styling. 9:16 vertical ratio. Cinematic thriller vibe.' },
                            { name: '🔢 Group Trend', prompt: 'Group shot of 5-7 lookalike versions of same person in different poses/expressions within one frame. Diverse expressions showing personality range. Bright cheerful background. Group 7 trend inspired. Fun and shareable aesthetic. Ultra-realistic with artistic composition.' },
                            { name: '🏆 Trophy Meme', prompt: 'Person lying in bed with World Cup trophy or similar iconic object, playful and humorous pose. Warm bedroom lighting, cozy aesthetic. Ultra-realistic, funny and shareable. Perfect for viral engagement. High quality, well-lit, genuine smile.' }
                        ].map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => setPrompt(preset.prompt)}
                                style={{
                                    padding: '8px 4px',
                                    fontSize: '11px',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#aaa',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#aaa';
                                }}
                                title={preset.name + ': ' + preset.prompt}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder={`Describe the image you want to generate...${appearance ? `\n\nBase appearance: ${appearance}` : ''}`}
                        rows={6}
                        disabled={progressState.status !== 'idle'}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'black',
                            border: '1px solid #333',
                            color: 'white',
                            borderRadius: '8px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                    {appearance && (
                        <p style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                            💡 Your character's appearance will be automatically prepended
                        </p>
                    )}
                </div>

                {/* Negative Prompt */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#ccc', fontWeight: '600' }}>
                        Negative Prompt
                    </label>
                    <textarea
                        value={negativePrompt}
                        onChange={e => setNegativePrompt(e.target.value)}
                        placeholder="What to avoid in the image..."
                        rows={3}
                        disabled={progressState.status !== 'idle'}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'black',
                            border: '1px solid #333',
                            color: 'white',
                            borderRadius: '8px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Number of Images */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#ccc', fontWeight: '600' }}>
                        Number of Images
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={numImages}
                        onChange={e => setNumImages(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        disabled={progressState.status !== 'idle'}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'black',
                            border: '1px solid #333',
                            color: 'white',
                            borderRadius: '8px'
                        }}
                    />
                </div>

                {/* Progress Indicator */}
                {progressState.status !== 'idle' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>
                                {progressState.message}
                            </span>
                            <span style={{ fontSize: '12px', color: '#888' }}>
                                {Math.round(progressState.progress)}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#222',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid #333'
                        }}>
                            <div style={{
                                width: `${progressState.progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                transition: 'width 0.3s ease',
                                boxShadow: progressState.progress > 0 ? '0 0 10px rgba(102, 126, 234, 0.5)' : 'none'
                            }} />
                        </div>
                    </div>
                )}


                {/* Aspect Ratio Selector */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#ccc', fontWeight: '600' }}>
                        📐 Aspect Ratio
                    </label>
                    <select
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'black',
                            border: '1px solid #333',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="1:1">1:1 Square (Instagram)</option>
                        <option value="16:9">16:9 Landscape (YouTube)</option>
                        <option value="5:4">5:4 Portrait</option>
                        <option value="4:3">4:3 Classic</option>
                        <option value="3:2">3:2 Photography</option>
                        <option value="2.39:1">2.39:1 Cinematic Wide</option>
                        <option value="21:9">21:9 Ultra Wide</option>
                        <option value="18:9">18:9 Tall (Modern Phone)</option>
                        <option value="17:9">17:9 Tall</option>
                        <option value="1.85:1">1.85:1 Widescreen</option>
                    </select>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={progressState.status !== 'idle' || !loraPath}
                    style={{
                        padding: '14px 24px',
                        background: progressState.status !== 'idle' || !loraPath ? '#444' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: progressState.status !== 'idle' || !loraPath ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        opacity: progressState.status !== 'idle' || !loraPath ? 0.6 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    {progressState.status !== 'idle' ? '⏳ Generating...' : '✨ Generate Images'}
                </button>

                {!loraPath && (
                    <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>
                        ⚠️ Please configure a LoRA in Settings first
                    </p>
                )}
            </div>

            {/* Right Panel - Generated Images */}
            <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflowY: 'auto',
                maxHeight: '700px'
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                    Generated Images ({generatedImages.length})
                </h3>

                {generatedImages.length === 0 ? (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: '#666',
                        border: '2px dashed #333',
                        borderRadius: '12px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                        <p>Your generated images will appear here</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {generatedImages.map((imageUrl, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: 'relative',
                                    background: '#111',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #333'
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt={`Generated ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setPreviewImage(imageUrl)}
                                />
                                <div style={{
                                    padding: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    background: 'rgba(0,0,0,0.8)'
                                }}>
                                    <button
                                        onClick={() => handleSaveToLibrary(imageUrl)}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            background: '#6366f1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        💾 Save
                                    </button>
                                    <button
                                        onClick={() => handlePostToFanvue(imageUrl)}
                                        disabled={isPosting === imageUrl}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#0ea5e9',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isPosting === imageUrl ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            opacity: isPosting === imageUrl ? 0.7 : 1
                                        }}
                                    >
                                        {isPosting === imageUrl ? '⏳...' : '🚀 Post'}
                                    </button>


                                    <a
                                        href={imageUrl}
                                        download
                                        style={{
                                            padding: '8px 12px',
                                            background: '#333',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ⬇️
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {
                previewImage && (
                    <div
                        onClick={() => setPreviewImage(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </div >
    );
}
