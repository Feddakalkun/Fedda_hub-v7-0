'use client';

import { useState } from 'react';
import { geminiHelper } from '@/lib/ai/gemini-helper';

interface GeneratedPost {
    imageUrl: string;
    caption: string;
    scenario: string;
    platforms: string[];
}

export default function ViralGeneratorPage() {
    const [selectedLora, setSelectedLora] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [postCount, setPostCount] = useState(30);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
    const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

    const viralScenarios = [
        'Gym mirror selfie, post-workout glow, sports bra and leggings',
        'Morning coffee on balcony, cozy oversized sweater, messy bun',
        'Beach sunset, bikini, wet hair, golden hour lighting',
        'Luxury rooftop restaurant, elegant evening gown, city lights bokeh',
        'Gaming setup, RGB lights, headset, cute gamer girl aesthetic',
        'Street fashion, leather jacket, crop top, urban background',
        'Bed selfie POV, silk pajamas, morning light through window',
        'Office desk, pencil skirt and blouse, professional but sexy',
        'Yoga pose, tight yoga pants, mat, zen aesthetic',
        'Pool day, bikini, sunglasses, inflatable float',
        'Car selfie, seatbelt across chest, casual outfit',
        'Shopping mall, trying on clothes, fitting room mirror',
        'Home workout, sports bra, doing stretches',
        'Cooking in kitchen, cute apron, messy hair',
        'Bubble bath, candles, relaxing aesthetic',
    ];

    const handleGenerate = async () => {
        if (!selectedLora || !characterName) {
            alert('Please select a LoRA and enter a character name');
            return;
        }

        setIsGenerating(true);
        setProgress({ current: 0, total: postCount, status: 'Starting...' });
        const posts: GeneratedPost[] = [];

        try {
            for (let i = 0; i < postCount; i++) {
                const scenario = viralScenarios[i % viralScenarios.length];
                setProgress({ current: i + 1, total: postCount, status: `Generating: ${scenario.substring(0, 50)}...` });

                // Generate image via ComfyUI
                const imageResponse = await fetch('/api/comfyui/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workflow: {}, // Will be populated with Z-IMAGE workflow
                        params: {
                            prompt: `${characterName}, ${scenario}, ultra detailed, realistic, 8k, instagram aesthetic`,
                            loras: [{ name: selectedLora, strength: 1.0 }],
                            width: 832,
                            height: 1216, // 9:16 portrait
                        },
                    }),
                });

                if (!imageResponse.ok) {
                    console.error(`Failed to generate image ${i + 1}`);
                    continue;
                }

                const imageData = await imageResponse.json();

                // Generate caption using Gemini
                setProgress({ current: i + 1, total: postCount, status: 'Generating AI caption...' });
                const caption = await fetch('/api/ai/generate-caption', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scenario,
                        characterName,
                        tone: 'flirty',
                    }),
                }).then(r => r.json()).then(d => d.caption);

                posts.push({
                    imageUrl: imageData.imageUrl || '',
                    caption,
                    scenario,
                    platforms: ['fanvue', 'instagram', 'twitter'],
                });

                setGeneratedPosts([...posts]);

                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            setProgress({ current: postCount, total: postCount, status: '✅ Complete!' });
        } catch (error) {
            console.error('Generation error:', error);
            setProgress({ ...progress, status: '❌ Error occurred' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePostToAll = async (post: GeneratedPost) => {
        // Post to all platforms
        for (const platform of post.platforms) {
            await fetch(`/api/social/${platform}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: post.imageUrl,
                    caption: post.caption,
                }),
            });
        }
        alert('Posted to all platforms!');
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px', background: 'linear-gradient(135deg, #ff0080, #7928ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🚀 Viral Content Generator
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '48px' }}>
                Generate 30 viral posts in minutes. AI-powered captions. Multi-platform posting.
            </p>

            {/* Setup */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Setup</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Character LoRA</label>
                        <input
                            type="text"
                            value={selectedLora}
                            onChange={(e) => setSelectedLora(e.target.value)}
                            placeholder="your_character.safetensors"
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Character Name</label>
                        <input
                            type="text"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            placeholder="e.g., Emma, Sophia, Luna"
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Number of Posts</label>
                        <input
                            type="number"
                            value={postCount}
                            onChange={(e) => setPostCount(parseInt(e.target.value))}
                            min="1"
                            max="100"
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedLora || !characterName}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '24px', padding: '20px', fontSize: '18px', fontWeight: '700' }}
                >
                    {isGenerating ? `⏳ Generating ${progress.current}/${progress.total}...` : '🚀 Generate Viral Content'}
                </button>

                {isGenerating && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>{progress.status}</div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(progress.current / progress.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ff0080, #7928ca)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Generated Posts */}
            {generatedPosts.length > 0 && (
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                        Generated Posts ({generatedPosts.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {generatedPosts.map((post, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt={`Post ${i + 1}`} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }} />
                                )}
                                <div style={{ padding: '16px' }}>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.6' }}>
                                        {post.caption}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        {post.platforms.map(p => (
                                            <span key={p} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px' }}>
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePostToAll(post)}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                                    >
                                        📤 Post to All Platforms
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
