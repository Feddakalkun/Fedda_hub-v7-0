'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useComfyProgress } from '@/hooks/useComfyProgress';
import ImageGenerator from '@/components/ImageGenerator';
import LipsyncGenerator from '@/components/LipsyncGenerator';
import Library from '@/components/Library';

import LTX2Generator from '@/components/LTX2Generator';
import QwenGenerator from '@/components/QwenGenerator';

// Interfaces matching Prisma schema
interface Character {
    id: string;
    name: string;
    slug: string;
    handle?: string;
    bio?: string;
    isConnected: boolean;
    loraPath?: string;
    qwenLoraPath?: string;
    appearance?: string;
    avatarUrl?: string;
    voiceProvider?: string;
    voiceModel?: string;
    voiceId?: string; // ElevenLabs ID
    voiceDescription?: string;
    llmModel?: string;
    systemInstruction?: string;
}

export default function CharacterDashboard({ params }: { params: Promise<{ slug: string }> }) {
    // Next.js 15+ unwraps params
    const { slug } = use(params);
    const router = useRouter();

    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'image' | 'lipsync' | 'wan21' | 'qwen' | 'library' | 'settings'>('image');

    // Persistent state for generated content (survives tab switches)
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedVideos, setGeneratedVideos] = useState<{ url: string, text: string }[]>([]);

    // Settings State
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Character>>({});

    // Avatar Upload State
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [uploadUrl, setUploadUrl] = useState('');
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

    // ComfyUI Progress Tracking
    const { state: progressState, startMonitoring, reset: resetProgress } = useComfyProgress();

    // Fetch Ollama models when settings tab is active
    const [ollamaModels, setOllamaModels] = useState<any[]>([]);
    useEffect(() => {
        if (activeTab === 'settings') {
            fetch('/api/ollama/models').then(res => res.json()).then(data => {
                if (data.success) setOllamaModels(data.models);
            }).catch(err => console.error("Failed to load models", err));
        }
    }, [activeTab]);

    useEffect(() => {
        loadCharacter();
    }, [slug]);


    const loadCharacter = async () => {
        try {
            const res = await fetch(`/api/characters/${slug}`);
            const data = await res.json();
            if (data.success) {
                setCharacter(data.character);
                setEditForm(data.character);
                if (data.character.avatarUrl) setUploadUrl(data.character.avatarUrl);
            } else {
                alert('Character not found');
                router.push('/characters');
            }
        } catch (e) {
            console.error('Failed to load character', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        window.location.href = `/api/auth/fanvue?persona=${slug}`;
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch(`/api/characters/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setCharacter(prev => ({ ...prev!, ...data.character }));
                setEditMode(false);
                alert('Settings saved successfully');
            } else {
                alert('Failed to save: ' + data.error);
            }
        } catch (e) {
            alert('Error saving settings');
        }
    };

    const handleAvatarUpdate = async () => {
        if (!uploadUrl) return;
        try {
            // Save to DB
            const res = await fetch(`/api/characters/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...character, avatarUrl: uploadUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setCharacter(prev => ({ ...prev!, avatarUrl: uploadUrl }));
                setIsAvatarModalOpen(false);
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (e) {
            alert('Failed to update avatar');
        }
    };

    const handleGenerateAvatar = async () => {
        try {
            // Start the generation process
            const res = await fetch(`/api/characters/${slug}/generate-avatar`, {
                method: 'POST',
            });
            const data = await res.json();

            if (!data.success) {
                alert('Failed to start generation: ' + data.error);
                return;
            }

            // Start monitoring via hook (auto-handles WebSocket + polling fallback)
            startMonitoring(data.promptId);

        } catch (e) {
            console.error('Generation error:', e);
            alert('Failed to generate avatar');
        }
    };

    // Handle completion - save avatar when done
    useEffect(() => {
        if (progressState.status === 'done' && progressState.promptId) {
            const saveAvatar = async () => {
                try {
                    const saveRes = await fetch(`/api/characters/${slug}/save-avatar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ promptId: progressState.promptId })
                    });
                    const saveData = await saveRes.json();

                    if (saveData.success && saveData.avatarUrl) {
                        setCharacter(prev => ({ ...prev!, avatarUrl: saveData.avatarUrl }));
                        setUploadUrl(saveData.avatarUrl);

                        // Close modal after brief delay
                        setTimeout(() => {
                            setIsAvatarModalOpen(false);
                            resetProgress();
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Save avatar error:', error);
                    alert('Failed to save generated avatar');
                }
            };

            saveAvatar();
        }
    }, [progressState.status, progressState.promptId, slug, resetProgress]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to DELETE this character? This cannot be undone.')) return;
        try {
            await fetch(`/api/characters/${slug}`, { method: 'DELETE' });
            router.push('/characters');
        } catch (e) {
            alert('Delete failed');
        }
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading Data...</div>;
    if (!character) return <div>Not Found</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>

            {/* Fullscreen Image Preview */}
            {isImagePreviewOpen && character.avatarUrl && (
                <div
                    onClick={() => setIsImagePreviewOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.95)', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={character.avatarUrl}
                            alt={character.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {/* Close button */}
                        <button
                            onClick={() => setIsImagePreviewOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '0',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}

            {/* Avatar Update Modal */}
            {isAvatarModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#1a1a1a', padding: '32px', borderRadius: '16px',
                        width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Update Profile Picture</h3>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#ccc' }}>Image URL</label>
                            <input
                                value={uploadUrl}
                                onChange={e => setUploadUrl(e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                disabled={progressState.status !== 'idle'}
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                Paste a URL from your Content Library or generate one with AI.
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        {progressState.status !== 'idle' && (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>
                                        {progressState.message}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                        {Math.round(progressState.progress)}%
                                    </span>
                                </div>
                                {/* Progress Bar */}
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={handleGenerateAvatar}
                                disabled={progressState.status !== 'idle'}
                                style={{
                                    padding: '8px 20px',
                                    background: progressState.status !== 'idle' ? '#444' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: progressState.status !== 'idle' ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    opacity: progressState.status !== 'idle' ? 0.6 : 1
                                }}
                            >
                                {progressState.status !== 'idle' ? '🎨 Generating...' : '✨ Generate with AI'}
                            </button>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setIsAvatarModalOpen(false)}
                                    disabled={progressState.status !== 'idle'}
                                    style={{ padding: '8px 16px', background: 'transparent', color: '#ccc', border: 'none', cursor: progressState.status !== 'idle' ? 'not-allowed' : 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAvatarUpdate}
                                    disabled={progressState.status !== 'idle'}
                                    style={{
                                        padding: '8px 24px',
                                        background: progressState.status !== 'idle' ? '#444' : '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: progressState.status !== 'idle' ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Save URL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Avatar with Preview/Edit */}
                <div
                    style={{
                        position: 'relative',
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#222', border: '1px solid #333',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', overflow: 'hidden', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                        const overlay = e.currentTarget.querySelector('.avatar-overlay');
                        if (overlay) (overlay as HTMLElement).style.opacity = '1';
                    }}
                    onMouseLeave={e => {
                        const overlay = e.currentTarget.querySelector('.avatar-overlay');
                        if (overlay) (overlay as HTMLElement).style.opacity = '0';
                    }}
                >
                    {character.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={character.avatarUrl}
                            alt={character.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onClick={() => setIsImagePreviewOpen(true)}
                        />
                    ) : (
                        <span onClick={() => setIsAvatarModalOpen(true)}>{character.name.charAt(0)}</span>
                    )}

                    {/* View/Edit Overlay */}
                    <div className="avatar-overlay" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                        color: 'white', fontWeight: 'bold', fontSize: '10px',
                        gap: '4px'
                    }}>
                        {character.avatarUrl && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsImagePreviewOpen(true);
                                }}
                                style={{
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    pointerEvents: 'all'
                                }}
                            >
                                👁️ VIEW
                            </div>
                        )}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAvatarModalOpen(true);
                            }}
                            style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                pointerEvents: 'all'
                            }}
                        >
                            ✏️ EDIT
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{character.name}</h1>
                    <div style={{ fontSize: '14px', color: '#888', display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <span>{character.handle}</span>
                        <span>•</span>
                        <span>{character.bio || 'No bio set'}</span>
                    </div>
                </div>
                <div>
                    {character.isConnected ? (
                        <div style={{
                            padding: '8px 16px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            borderRadius: '8px',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            fontSize: '14px', fontWeight: '600'
                        }}>
                            ✓ Connected
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            style={{
                                padding: '10px 20px',
                                background: '#f87171',
                                color: '#111',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Connect Fanvue
                        </button>
                    )}
                </div>
            </div>

            {/* Global Navigation */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px', width: 'fit-content', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('image')} style={{ padding: '8px 20px', background: activeTab === 'image' ? '#6366f1' : 'transparent', color: activeTab === 'image' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>🎨 Text to Image</button>
                <button onClick={() => setActiveTab('lipsync')} style={{ padding: '8px 20px', background: activeTab === 'lipsync' ? '#6366f1' : 'transparent', color: activeTab === 'lipsync' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>🎬 Lipsync</button>
                <button onClick={() => setActiveTab('wan21')} style={{ padding: '8px 20px', background: activeTab === 'wan21' ? '#6366f1' : 'transparent', color: activeTab === 'wan21' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>🎥 Wan 2.1</button>
                <button onClick={() => setActiveTab('qwen')} style={{ padding: '8px 20px', background: activeTab === 'qwen' ? '#8b5cf6' : 'transparent', color: activeTab === 'qwen' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>✨ Qwen Edit</button>

                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 12px' }} />

                <button onClick={() => setActiveTab('library')} style={{ padding: '8px 20px', background: activeTab === 'library' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'library' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>📚 Library</button>
                <button onClick={() => setActiveTab('settings')} style={{ padding: '8px 20px', background: activeTab === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'settings' ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>⚙️ Settings</button>
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '400px' }}>

                {activeTab === 'image' && (
                    <ImageGenerator
                        characterSlug={slug}
                        characterName={character.name}
                        loraPath={character.loraPath}
                        appearance={character.appearance}
                        generatedImages={generatedImages}
                        setGeneratedImages={setGeneratedImages}
                    />
                )}

                {activeTab === 'lipsync' && (
                    <LipsyncGenerator
                        characterSlug={slug}
                        characterName={character.name}
                        avatarUrl={character.avatarUrl}
                        generatedVideos={generatedVideos}
                        setGeneratedVideos={setGeneratedVideos}
                    />
                )}

                {activeTab === 'wan21' && <LTX2Generator characterSlug={slug} />}

                {activeTab === 'qwen' && <QwenGenerator characterSlug={slug} qwenLoraPath={character.qwenLoraPath} />}

                {activeTab === 'library' && (
                    <Library characterSlug={slug} />
                )}

                {activeTab === 'settings' && (
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '24px' }}>Character Settings</h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Name</label>
                                <input
                                    value={editForm.name || ''}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Handle</label>
                                <input
                                    value={editForm.handle || ''}
                                    onChange={e => setEditForm({ ...editForm, handle: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Bio</label>
                                <textarea
                                    value={editForm.bio || ''}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>LoRA Filename (Z-Image / Flux)</label>
                                <input
                                    value={editForm.loraPath || ''}
                                    onChange={e => setEditForm({ ...editForm, loraPath: e.target.value })}
                                    placeholder="e.g. MyChar_v1.safetensors"
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Qwen LoRA Filename</label>
                                <input
                                    value={editForm.qwenLoraPath || ''}
                                    onChange={e => setEditForm({ ...editForm, qwenLoraPath: e.target.value })}
                                    placeholder="e.g. iris_qwen.safetensors"
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Appearance Prompt</label>
                                <textarea
                                    value={editForm.appearance || ''}
                                    onChange={e => setEditForm({ ...editForm, appearance: e.target.value })}
                                    placeholder="e.g. blonde hair, blue eyes, athletic build..."
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>

                            {/* AI Brain Settings */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>LLM Model (Brain)</label>
                                <select
                                    value={editForm.llmModel || 'mistral'}
                                    onChange={e => setEditForm({ ...editForm, llmModel: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                >
                                    <option value="mistral">mistral (Default)</option>
                                    {ollamaModels.filter(m => m.name !== 'mistral').map((m: any) => (
                                        <option key={m.name} value={m.name}>{m.name}</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                    Select the Ollama model to use for this character's responses.
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>System Instructions / Memory</label>
                                <textarea
                                    value={editForm.systemInstruction || ''}
                                    onChange={e => setEditForm({ ...editForm, systemInstruction: e.target.value })}
                                    placeholder="Define personality rules, formatting constraints, or persistent memories here. (e.g. 'Start every sentence with *sigh*', 'You are secretly a spy')"
                                    rows={5}
                                    style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                                />
                            </div>

                            {/* Voice Settings */}
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#aaa', margin: 0 }}>Voice Settings</h4>
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            const text = "Hello! This is a voice preview.";

                                            // Browser Fallback (Fast)
                                            if (editForm.voiceProvider === 'browser') {
                                                if (window.speechSynthesis) {
                                                    window.speechSynthesis.cancel();
                                                    const u = new SpeechSynthesisUtterance(text);
                                                    const voices = window.speechSynthesis.getVoices();
                                                    // Try to match female voice
                                                    const v = voices.find(x => x.name.includes('Female') || x.name.includes('Google US English'));
                                                    if (v) u.voice = v;
                                                    u.pitch = 1.1;
                                                    window.speechSynthesis.speak(u);
                                                }
                                                return;
                                            }

                                            // API Call
                                            try {
                                                const res = await fetch('/api/gemini/tts', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        text,
                                                        voiceProvider: editForm.voiceProvider,
                                                        voiceModel: editForm.voiceModel,
                                                        voiceId: editForm.voiceId,
                                                        voiceDescription: editForm.voiceDescription
                                                    })
                                                });
                                                if (!res.ok) {
                                                    const err = await res.json();
                                                    // Should we fallback to browser if Gemini failed? 
                                                    // Yes, to match PhoneCall behavior.
                                                    if ((editForm.voiceProvider || 'gemini') === 'gemini') {
                                                        console.warn("Gemini Preview failed, falling back to browser:", err);
                                                        if (window.speechSynthesis) {
                                                            window.speechSynthesis.cancel();
                                                            const u = new SpeechSynthesisUtterance(text);
                                                            const voices = window.speechSynthesis.getVoices();
                                                            // Try to match female voice
                                                            const v = voices.find(x => x.name.includes('Female') || x.name.includes('Google US English'));
                                                            if (v) u.voice = v;
                                                            u.pitch = 1.1;
                                                            window.speechSynthesis.speak(u);
                                                            return;
                                                        }
                                                    }

                                                    // For ElevenLabs or other errors, show alert
                                                    alert("Preview Failed: " + (err.error || "Unknown Error") + "\n" + (err.details ? JSON.stringify(err.details) : ""));
                                                    return;
                                                }
                                                const blob = await res.blob();
                                                new Audio(URL.createObjectURL(blob)).play();
                                            } catch (e: any) {
                                                alert("Error: " + e.message);
                                            }
                                        }}
                                        style={{ fontSize: '12px', padding: '6px 12px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ▶ Play Preview
                                    </button>
                                </div>

                                {/* Provider Selector */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Voice Provider</label>
                                    <select
                                        value={editForm.voiceProvider || 'gemini'}
                                        onChange={e => setEditForm({ ...editForm, voiceProvider: e.target.value })}
                                        style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                    >
                                        <option value="gemini">Gemini (Experimental)</option>
                                        <option value="elevenlabs">ElevenLabs</option>
                                        <option value="browser">Browser (Free)</option>
                                    </select>
                                </div>

                                {(editForm.voiceProvider === 'elevenlabs') && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>ElevenLabs Voice ID</label>
                                        <input
                                            value={editForm.voiceId || ''}
                                            onChange={e => setEditForm({ ...editForm, voiceId: e.target.value })}
                                            placeholder="Voice ID"
                                            style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}

                                {(!editForm.voiceProvider || editForm.voiceProvider === 'gemini') && (
                                    <div>
                                        <h4 style={{ display: 'none' }}>Hidden</h4>

                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Voice Model</label>
                                            <select
                                                value={editForm.voiceModel || 'Puck'}
                                                onChange={e => setEditForm({ ...editForm, voiceModel: e.target.value })}
                                                style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                            >
                                                <option value="Puck">Puck (Default)</option>
                                                <option value="Charon">Charon</option>
                                                <option value="Kore">Kore</option>
                                                <option value="Fenrir">Fenrir</option>
                                                <option value="Aoede">Aoede</option>
                                            </select>
                                            <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Choose a base voice model</p>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#888' }}>Voice Description (Optional)</label>
                                            <textarea
                                                value={editForm.voiceDescription || ''}
                                                onChange={e => setEditForm({ ...editForm, voiceDescription: e.target.value })}
                                                placeholder="e.g. Young female voice, energetic and playful, slightly raspy..."
                                                rows={2}
                                                style={{ width: '100%', padding: '12px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                            />
                                            <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Describe the voice characteristics in natural language</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                <button
                                    onClick={handleDelete}
                                    style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Delete Character
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    style={{ padding: '12px 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
