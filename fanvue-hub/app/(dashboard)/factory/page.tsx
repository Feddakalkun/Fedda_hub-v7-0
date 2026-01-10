'use client';

import { useState, useEffect } from 'react';

interface GeneratedPost {
    id: string;
    imageUrl: string;
    prompt: string;
    scenario: string;
    timestamp: number;
    status: 'generated' | 'scheduled' | 'posted';
    videoUrl?: string;
    isCreatingVideo?: boolean;
}

export default function ContentFactoryPage() {
    const [availableLoras, setAvailableLoras] = useState<string[]>([]);
    const [selectedLora, setSelectedLora] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [batchSize, setBatchSize] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [contentLibrary, setContentLibrary] = useState<GeneratedPost[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

    // Load available LoRAs and posts on mount
    useEffect(() => {
        loadLoras();
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            if (data.success && data.posts) {
                // Convert database posts to GeneratedPost format
                const converted: GeneratedPost[] = data.posts.map((p: any) => ({
                    id: p.id,
                    imageUrl: p.mediaUrls ? JSON.parse(p.mediaUrls)[0]?.url || '' : '',
                    prompt: p.content,
                    scenario: p.title,
                    timestamp: new Date(p.createdAt).getTime(),
                    status: p.status === 'published' ? 'posted' : (p.scheduledFor ? 'scheduled' : 'generated'),
                }));
                setContentLibrary(converted);
            }
        } catch (err) {
            console.error('Failed to load posts:', err);
        }
    };

    const loadLoras = async () => {
        try {
            const response = await fetch('/api/comfyui/models');
            const data = await response.json();
            if (data.success && data.models?.loras) {
                setAvailableLoras(data.models.loras);
                if (data.models.loras.length > 0) {
                    setSelectedLora(data.models.loras[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load LoRAs:', err);
        }
    };

    const VIRAL_SCENARIOS = {
        'Gym Mirror Selfie': { outfit: 'tight matching yoga set, sports bra and leggings, visible abs', action: 'taking mirror selfie, holding phone, post-workout glow, sweating', location: 'luxury gym with mirrors, natural window light' },
        'Yoga Pose': { outfit: 'tight yoga pants and sports bra, barefoot', action: 'doing downward dog pose, flexible, focused expression', location: 'yoga mat at home, plants in background' },
        'Home Workout': { outfit: 'sports bra and shorts, hair in ponytail', action: 'doing pushups, determined face, athletic', location: 'home gym setup, dumbbells visible' },
        'Pool Day': { outfit: 'bikini, sunglasses on head', action: 'sitting on pool edge, legs in water, relaxed smile', location: 'luxury pool, palm trees, sunny day' },
        'Morning Coffee': { outfit: 'oversized knitted sweater and cute shorts, messy hair', action: 'holding hot cup of coffee, sleepy smile, yawning', location: 'cozy balcony with morning sunlight, plants' },
        'Bed Selfie': { outfit: 'silk pajamas or cute tank top, no makeup', action: 'lying in bed, POV shot looking up at camera, natural beauty', location: 'messy white bed sheets, soft morning light through window' },
        'Cooking Cute': { outfit: 'cute apron over casual clothes, hair tied back', action: 'cooking breakfast, holding spatula, playful smile', location: 'modern kitchen, ingredients on counter' },
        'Bubble Bath': { outfit: 'shoulders visible, bubbles covering body', action: 'relaxing in bath, eyes closed, peaceful expression', location: 'luxury bathroom, candles, rose petals' },
        'Car Selfie': { outfit: 'casual cute outfit, seatbelt across chest', action: 'taking selfie in car, natural smile, one hand on wheel', location: 'inside car, dashboard visible, sunny day' },
        'Street Fashion': { outfit: 'trendy leather jacket, crop top, baggy jeans, sneakers', action: 'walking confidently, sunglasses, candid street style', location: 'busy city street, urban background, golden hour' },
        'Shopping Mall': { outfit: 'cute casual outfit, shopping bags in hand', action: 'trying on clothes, looking in mirror, excited expression', location: 'fitting room or mall corridor, bright lights' },
        'Beach Sunset': { outfit: 'colorful bikini, beach cover-up', action: 'walking in shallow water, looking back at camera, wet hair', location: 'golden hour beach, waves, sunset colors' },
        'Cozy Gamer': { outfit: 'oversized hoodie and thigh highs, cute and comfy', action: 'sitting in gaming chair, wearing headset, holding controller', location: 'bedroom with neon RGB lights, gaming setup' },
        'Luxury Date Night': { outfit: 'elegant black evening gown, diamond jewelry, heels', action: 'sipping champagne, seductive smile, sophisticated', location: 'rooftop restaurant at night, city lights bokeh' },
        'Hotel Room': { outfit: 'silk robe, elegant and classy', action: 'standing by window, looking at city view, contemplative', location: 'luxury hotel room, floor-to-ceiling windows, night' },
        'Private Jet': { outfit: 'designer outfit, sunglasses, luxury accessories', action: 'sitting in jet seat, legs crossed, confident pose', location: 'private jet interior, champagne visible' },
        'Office Chic': { outfit: 'tight pencil skirt and blouse, glasses, professional', action: 'sitting at desk, working on laptop, focused look', location: 'modern corporate office, city view' },
        'Nurse Fantasy': { outfit: 'medical scrubs, stethoscope, professional but cute', action: 'holding clipboard, caring smile, approachable', location: 'medical office or hospital room' },
        'Teacher Vibes': { outfit: 'professional dress, glasses, elegant', action: 'standing by whiteboard, holding marker, teaching pose', location: 'classroom or study, books visible' },
        'Rainy Day Cozy': { outfit: 'oversized sweater, fuzzy socks, comfy', action: 'sitting by window with tea, watching rain, peaceful', location: 'window seat, rain outside, warm interior lighting' },
        'Summer Picnic': { outfit: 'sundress, sun hat, casual summer vibes', action: 'sitting on picnic blanket, eating fruit, happy smile', location: 'park with trees, sunny day, grass' },
    };

    const handleBatchGenerate = async () => {
        if (!selectedLora || !characterName) {
            alert('Please enter LoRA filename and character name');
            return;
        }

        setIsGenerating(true);
        setProgress({ current: 0, total: batchSize });

        // Step 1: Generate unique story ideas using Gemini
        console.log('Generating story ideas...');
        let storyIdeas: any[] = [];
        try {
            const storiesRes = await fetch('/api/ai/generate-stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterName,
                    contentType: 'mixed',
                    count: batchSize,
                }),
            });
            const storiesData = await storiesRes.json();
            if (storiesData.success) {
                storyIdeas = storiesData.ideas;
            }
        } catch (err) {
            console.error('Failed to generate stories:', err);
        }

        // Fallback if story generation fails
        if (storyIdeas.length === 0) {
            storyIdeas = Array(batchSize).fill(null).map((_, i) => ({
                title: `Content ${i + 1}`,
                outfit: 'casual outfit',
                action: 'posing for camera',
                location: 'cozy room',
                mood: 'playful',
                caption_hook: 'What do you think? 💋',
            }));
        }

        const newPosts: GeneratedPost[] = [];

        for (let i = 0; i < Math.min(batchSize, storyIdeas.length); i++) {
            setProgress({ current: i + 1, total: batchSize });

            const story = storyIdeas[i];

            // Build prompt from story (include text element if present)
            const textPart = story.text_element ? `, handwritten text saying "${story.text_element}"` : '';
            const fullPrompt = `${characterName}, ${story.outfit}, ${story.action}, ${story.location}, ${story.mood} mood${textPart}, ultra detailed, realistic, 8k, instagram aesthetic, shot on iPhone`;

            try {
                // Load the Z-IMAGE workflow
                const workflowResponse = await fetch(`/comfyui/workflows/Z-IMAGE-new.json?t=${Date.now()}`);
                const workflow = await workflowResponse.json();

                // CRITICAL: Randomize seed for unique images!
                const randomSeed = Math.floor(Math.random() * 9999999999999);
                if (workflow['3']) {
                    workflow['3'].inputs.seed = randomSeed;
                }

                // Modify workflow with our parameters
                if (workflow['33']) workflow['33'].inputs.string = fullPrompt;
                if (workflow['34']) workflow['34'].inputs.string = 'worst quality, low quality, bad anatomy';
                if (workflow['13']) {
                    workflow['13'].inputs.width = 832;
                    workflow['13'].inputs.height = 1216;
                }

                // Inject LoRA (correct format from ZImageWorkflow)
                if (workflow['126']) {
                    workflow['126'].inputs['lora_1'] = {
                        on: true,
                        lora: selectedLora,
                        strength: 1.0,
                        strength_clip: 1.0,
                    };
                }

                // Submit to ComfyUI
                const response = await fetch('/api/comfyui/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workflow }),
                });

                const result = await response.json();

                if (result.success) {
                    // Wait a bit for generation
                    await new Promise(resolve => setTimeout(resolve, 15000));

                    // Try to get the image from history
                    const historyRes = await fetch(`/api/comfyui/history?promptId=${result.prompt_id}`);
                    const historyData = await historyRes.json();

                    let imageUrl = '';
                    if (historyData.success && historyData.images?.length) {
                        const img = historyData.images[0];
                        imageUrl = `/api/comfyui/view?filename=${img.filename}&subfolder=${img.subfolder || ''}&type=${img.type || 'output'}`;
                    }

                    // Generate AI caption using Gemini
                    // Use the story's caption_hook as caption (or generate one)
                    const caption = story.caption_hook || story.title || fullPrompt;

                    // Save to database
                    try {
                        const saveResponse = await fetch('/api/posts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                characterName,
                                title: story.title || `Story ${i + 1}`,
                                content: caption,
                                mediaUrls: [{ url: imageUrl, type: 'image' }],
                                scenario: story.title,
                            }),
                        });
                        const saveData = await saveResponse.json();

                        if (saveData.success) {
                            newPosts.push({
                                id: saveData.post.id,
                                imageUrl,
                                prompt: caption,
                                scenario: story.title || `Story ${i + 1}`,
                                timestamp: Date.now(),
                                status: 'generated',
                            });
                        }
                    } catch (saveErr) {
                        console.error('Failed to save post to database:', saveErr);
                        // Fallback to in-memory only
                        newPosts.push({
                            id: `post_${Date.now()}_${i}`,
                            imageUrl,
                            prompt: caption,
                            scenario: story.title || `Story ${i + 1}`,
                            timestamp: Date.now(),
                            status: 'generated',
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to generate post ${i + 1}:`, err);
            }
        }

        setContentLibrary([...contentLibrary, ...newPosts]);
        setIsGenerating(false);
    };

    const handlePostSelected = async () => {
        for (const postId of selectedPosts) {
            const post = contentLibrary.find(p => p.id === postId);
            if (!post) continue;

            try {
                const response = await fetch('/api/fanvue/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: post.imageUrl,
                        caption: post.prompt,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    // Update status in database
                    await fetch('/api/posts', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: postId,
                            status: 'published',
                            fanvuePostId: result.post?.id,
                            publishedAt: new Date().toISOString(),
                        }),
                    });

                    // Update status in UI
                    setContentLibrary(contentLibrary.map(p =>
                        p.id === postId ? { ...p, status: 'posted' } : p
                    ));
                } else {
                    alert(`Failed to post "${post.scenario}": ${result.error}`);
                }
            } catch (err: any) {
                console.error('Failed to post:', err);
                alert(`Error posting "${post.scenario}": ${err.message}`);
            }
        }

        setSelectedPosts(new Set());
        alert('Posts published to Fanvue!');
    };

    const togglePostSelection = (postId: string) => {
        const newSelection = new Set(selectedPosts);
        if (newSelection.has(postId)) {
            newSelection.delete(postId);
        } else {
            newSelection.add(postId);
        }
        setSelectedPosts(newSelection);
    };

    const createViralVideo = async (postId: string) => {
        const post = contentLibrary.find(p => p.id === postId);
        if (!post || !post.imageUrl) return;

        // Mark as creating
        setContentLibrary(contentLibrary.map(p =>
            p.id === postId ? { ...p, isCreatingVideo: true } : p
        ));

        try {
            const response = await fetch('/api/viral/pipeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: post.imageUrl,
                    characterName,
                    scenario: post.scenario,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update with video URL
                setContentLibrary(contentLibrary.map(p =>
                    p.id === postId ? {
                        ...p,
                        videoUrl: data.video.url,
                        isCreatingVideo: false,
                        prompt: data.video.caption, // Update with better caption
                    } : p
                ));
                alert('🎉 Viral video created!');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            console.error('Video creation failed:', err);
            alert('Failed to create video: ' + err.message);
            setContentLibrary(contentLibrary.map(p =>
                p.id === postId ? { ...p, isCreatingVideo: false } : p
            ));
        }
    };

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>
                🏭 Content Factory
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '48px' }}>
                Generate 20-30 posts in one session. Store, schedule, and post to Fanvue.
            </p>

            {/* Batch Generator */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                    Step 1: Batch Generate
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Character LoRA ({availableLoras.length} available)
                        </label>
                        <select
                            value={selectedLora}
                            onChange={(e) => setSelectedLora(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        >
                            {availableLoras.map((lora) => (
                                <option key={lora} value={lora}>{lora}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Character Name
                        </label>
                        <input
                            type="text"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            placeholder="Emma, Sophia, Luna..."
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Batch Size
                        </label>
                        <input
                            type="number"
                            value={batchSize}
                            onChange={(e) => setBatchSize(parseInt(e.target.value))}
                            min="10"
                            max="50"
                            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleBatchGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '20px', fontSize: '18px', fontWeight: '700' }}
                >
                    {isGenerating ? `⏳ Generating ${progress.current}/${progress.total}...` : '🚀 Start Batch Generation'}
                </button>

                {isGenerating && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(progress.current / progress.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ff0080, #7928ca)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Library */}
            <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
                        Step 2: Content Library ({contentLibrary.length} posts)
                    </h2>
                    {selectedPosts.size > 0 && (
                        <button
                            onClick={handlePostSelected}
                            className="btn btn-primary"
                        >
                            📤 Post {selectedPosts.size} to Fanvue
                        </button>
                    )}
                </div>

                {contentLibrary.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                        <p>No content yet. Generate your first batch above!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        {contentLibrary.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => togglePostSelection(post.id)}
                                style={{
                                    cursor: 'pointer',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: selectedPosts.has(post.id) ? '3px solid #ff0080' : '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {post.imageUrl && (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.scenario}
                                        style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }}
                                    />
                                )}
                                <div style={{ padding: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        {post.scenario}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {post.status === 'posted' && <span style={{ padding: '2px 6px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px', fontSize: '10px' }}>✓ Posted</span>}
                                        {post.status === 'scheduled' && <span style={{ padding: '2px 6px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', fontSize: '10px' }}>⏰ Scheduled</span>}
                                        {post.status === 'generated' && <span style={{ padding: '2px 6px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '4px', fontSize: '10px' }}>📦 Ready</span>}
                                        {post.videoUrl && <span style={{ padding: '2px 6px', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '4px', fontSize: '10px' }}>🎬 Video</span>}
                                    </div>
                                    {!post.videoUrl && !post.isCreatingVideo && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); createViralVideo(post.id); }}
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '8px', fontSize: '12px', marginTop: '4px' }}
                                        >
                                            🎬 Create Viral Video
                                        </button>
                                    )}
                                    {post.isCreatingVideo && (
                                        <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>
                                            ⏳ Creating video...
                                        </div>
                                    )}
                                    {post.videoUrl && (
                                        <a
                                            href={post.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '8px', fontSize: '12px', marginTop: '4px', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                                        >
                                            ▶️ View Video
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
