"use client";

import { useState, useEffect } from 'react';

interface VoiceStudioProps {
    characterName: string; // 'Emily' or 'Thale'
    lastImage?: string;
}

interface VoiceOption {
    name: string;
    path: string;
}

export default function VoiceStudio({ characterName, lastImage }: VoiceStudioProps) {
    const [isOnline, setIsOnline] = useState(false);
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<VoiceOption[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationQuality, setAnimationQuality] = useState<'fast' | 'normal'>('fast');
    const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
    const [lastVideoUrl, setLastVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [animateStatus, setAnimateStatus] = useState<string | null>(null);

    // Check VoxCPM status and load voices
    useEffect(() => {
        checkStatus();
        loadVoices();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('http://localhost:7861/');
            setIsOnline(res.ok);
        } catch {
            setIsOnline(false);
        }
    };

    const loadVoices = async () => {
        setIsLoadingVoices(true);
        try {
            const res = await fetch(`/api/voxcpm/voices?character=${characterName.toLowerCase()}`);
            const data = await res.json();
            if (data.success && data.voices.length > 0) {
                setVoices(data.voices);
                setSelectedVoice(data.voices[0].path);
            }
        } catch (err) {
            console.error("Failed to load voices:", err);
        } finally {
            setIsLoadingVoices(false);
        }
    };

    const handleGenerate = async () => {
        if (!text) return;
        setIsGenerating(true);
        setError(null);
        setAnimateStatus(null);
        setLastAudioUrl(null);
        setLastVideoUrl(null);

        try {
            const res = await fetch('/api/voxcpm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voicePath: selectedVoice || undefined,
                    character: characterName.toLowerCase()
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Generation failed");
            }

            const result = await res.json();
            setLastAudioUrl(result.audio_url);

        } catch (err: any) {
            console.error(err);
            setError("Failed to generate audio. Make sure VoxCPM is running.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnimate = async () => {
        if (!lastAudioUrl || !lastImage) {
            setError("Missing audio or image source for animation.");
            return;
        }

        setIsAnimating(true);
        setAnimateStatus("Sending to ComfyUI...");
        setLastVideoUrl(null);

        try {
            const res = await fetch('/api/comfyui/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audioPath: lastAudioUrl,
                    imagePath: lastImage,
                    quality: animationQuality
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to trigger animation");
            }

            const data = await res.json();
            const promptId = data.prompt_id;
            setAnimateStatus(`Generating video... (ID: ${promptId})`);

            // Poll for completion
            let pollCount = 0;
            const maxPolls = 120; // 2 minutes max
            const pollInterval = setInterval(async () => {
                pollCount++;
                try {
                    const historyRes = await fetch(`/api/comfyui/history?promptId=${promptId}`);
                    const historyData = await historyRes.json();

                    if (historyData.success && historyData.videos?.length > 0) {
                        clearInterval(pollInterval);
                        const video = historyData.videos[0];
                        const videoUrl = `http://127.0.0.1:8188/api/view?filename=${video.filename}&subfolder=${encodeURIComponent(video.subfolder || '')}&type=${video.type || 'output'}`;
                        setLastVideoUrl(videoUrl);
                        setAnimateStatus("Video ready! ✨");
                        setIsAnimating(false);
                    } else if (pollCount >= maxPolls) {
                        clearInterval(pollInterval);
                        setAnimateStatus("Timeout - check ComfyUI output folder");
                        setIsAnimating(false);
                    }
                } catch (err) {
                    console.error("Poll error:", err);
                }
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError("Animation failed: " + err.message);
            setAnimateStatus(null);
            setIsAnimating(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎙️</span>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {characterName}'s Voice Studio
                    </h3>
                </div>
                <div>
                    {isOnline ? (
                        <span style={{ color: '#4ade80', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
                            <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span>
                            Online
                        </span>
                    ) : (
                        <button
                            onClick={checkStatus}
                            style={{
                                fontSize: '10px',
                                color: '#f87171',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            🔴 Offline
                        </button>
                    )}
                </div>
            </div>

            {/* Voice Selector */}
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap' }}>
                    Voice:
                </label>
                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        disabled={isLoadingVoices || voices.length === 0}
                        style={{
                            flex: 1,
                            padding: '4px 8px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '11px',
                            height: '28px'
                        }}
                    >
                        {voices.length === 0 ? (
                            <option>No voices found</option>
                        ) : (
                            voices.map(v => (
                                <option key={v.path} value={v.path}>{v.name}</option>
                            ))
                        )}
                    </select>
                    <button
                        onClick={loadVoices}
                        style={{
                            padding: '0 8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '10px',
                            cursor: 'pointer',
                            height: '28px'
                        }}
                        title="Refresh"
                    >
                        🔄
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`What should ${characterName} say?`}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        fontSize: '12px',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    {text.length} chars
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !isOnline || !text}
                    className="btn btn-primary"
                    style={{
                        background: (isGenerating || !isOnline || !text) ? 'rgba(255,255,255,0.1)' : 'white',
                        color: (isGenerating || !isOnline || !text) ? 'rgba(255,255,255,0.3)' : 'black',
                        opacity: 1,
                        padding: '6px 16px',
                        fontSize: '11px',
                        height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600'
                    }}
                >
                    {isGenerating ? 'Generating...' : 'Generate Voice'}
                </button>
            </div>

            {error && (
                <div style={{ marginTop: '12px', color: '#f87171', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {animateStatus && (
                <div style={{ marginTop: '12px', color: '#60a5fa', fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>
                    ℹ️ {animateStatus}
                </div>
            )}

            {lastAudioUrl && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '11px', margin: 0, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Generated Audio</h4>
                        <a
                            href={lastAudioUrl}
                            download={`voice_${characterName}_${Date.now()}.wav`}
                            style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
                        >
                            ⬇️ Save WAV
                        </a>
                    </div>

                    <audio
                        controls
                        src={lastAudioUrl}
                        style={{ width: '100%', height: '32px', marginBottom: '12px' }}
                    />

                    {/* Animation Controls - Compact */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => setAnimationQuality('fast')}
                                    style={{
                                        flex: 1,
                                        padding: '4px',
                                        background: animationQuality === 'fast' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                        border: `1px solid ${animationQuality === 'fast' ? 'white' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '4px',
                                        color: animationQuality === 'fast' ? 'white' : 'rgba(255,255,255,0.5)',
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚡ Fast
                                </button>
                                <button
                                    onClick={() => setAnimationQuality('normal')}
                                    style={{
                                        flex: 1,
                                        padding: '4px',
                                        background: animationQuality === 'normal' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                        border: `1px solid ${animationQuality === 'normal' ? 'white' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '4px',
                                        color: animationQuality === 'normal' ? 'white' : 'rgba(255,255,255,0.5)',
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✨ Normal
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn btn-secondary"
                            style={{
                                background: (!lastImage) ? '#333' : 'white',
                                color: (!lastImage) ? '#666' : 'black',
                                opacity: isAnimating ? 0.7 : 1,
                                fontSize: '11px',
                                padding: '4px 12px',
                                height: '28px',
                                whiteSpace: 'nowrap',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: !lastImage || isAnimating ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                            onClick={handleAnimate}
                            disabled={!lastImage || isAnimating}
                            title={!lastImage ? "Generate an image first to animate!" : `Send to ComfyUI Wan2.1 Workflow (${animationQuality})`}
                        >
                            {isAnimating ? '⏳' : '🎬 Animate'}
                        </button>
                    </div>
                </div>
            )}

            {lastVideoUrl && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                    <video
                        controls
                        src={lastVideoUrl}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            width: 'auto',
                            display: 'block',
                            margin: '0 auto 12px auto',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                        }}
                        autoPlay
                        loop
                    />
                    <a
                        href={lastVideoUrl}
                        download={`${characterName}_lipsync_${Date.now()}.mp4`}
                        className="btn btn-primary"
                        style={{
                            textDecoration: 'none',
                            padding: '6px 16px',
                            background: 'white',
                            color: 'black',
                            borderRadius: '4px',
                            fontWeight: '600'
                        }}
                    >
                        ⬇️ Download Video
                    </a>
                </div>
            )}
        </div>
    );
}
