'use client';

import { useState } from 'react';

export default function HybridGeneratorPage() {
    const [mode, setMode] = useState<'fal' | 'hybrid'>('fal');
    const [prompt, setPrompt] = useState('a beautiful nordic woman, 22 years old, fitness body, blonde wavy hair, blue eyes, freckles, wearing white crop top and jeans, smiling at camera, modern apartment, shot on iPhone, instagram aesthetic, natural lighting');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('9:16');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/hybrid/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    aspectRatio,
                    useComfyRefinement: mode === 'hybrid',
                    loras: mode === 'hybrid' ? [] : undefined, // Add your LoRAs here
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Generation failed');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                🚀 Hybrid Generator
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Combine Fal.ai FLUX Pro with ComfyUI for ultra-realistic, consistent characters
            </p>

            {/* Mode Selector */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Generation Mode</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button
                        onClick={() => setMode('fal')}
                        className={mode === 'fal' ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '16px', textAlign: 'left' }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Fal.ai Only</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Fast (10-15s) • Ultra-realistic</div>
                    </button>
                    <button
                        onClick={() => setMode('hybrid')}
                        className={mode === 'hybrid' ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '16px', textAlign: 'left' }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Hybrid Pipeline</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Slower (30s) • Consistent with LoRAs</div>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Aspect Ratio</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['1:1', '9:16', '16:9'] as const).map((ratio) => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={aspectRatio === ratio ? 'btn btn-primary' : 'btn btn-secondary'}
                                style={{ flex: 1 }}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                >
                    {isGenerating ? '⏳ Generating...' : '🎨 Generate Character'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <strong style={{ color: '#fca5a5' }}>Error:</strong> {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                        ✅ Generated ({result.source})
                    </h3>
                    {result.baseImageUrl && (
                        <div style={{ marginBottom: '16px' }}>
                            <img
                                src={result.baseImageUrl}
                                alt="Generated character"
                                style={{ width: '100%', maxWidth: '600px', borderRadius: '12px' }}
                            />
                        </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div>Source: {result.source}</div>
                        {result.metadata?.falSeed && <div>Seed: {result.metadata.falSeed}</div>}
                        {result.metadata?.comfyPromptId && <div>ComfyUI Prompt: {result.metadata.comfyPromptId}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
