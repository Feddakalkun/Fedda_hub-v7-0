'use client';

import { useState, useEffect } from 'react';

interface Wildcard {
    name: string;
    path: string;
    lineCount: number;
}

interface WildcardContent {
    name: string;
    lines: string[];
    count: number;
}

export default function WildcardsPage() {
    const [wildcards, setWildcards] = useState<Wildcard[]>([]);
    const [selectedWildcard, setSelectedWildcard] = useState<string | null>(null);
    const [wildcardContent, setWildcardContent] = useState<WildcardContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        loadWildcards();
    }, []);

    const loadWildcards = async () => {
        try {
            const res = await fetch('/api/comfyui/wildcards');
            const data = await res.json();
            if (data.success) {
                setWildcards(data.wildcards);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadWildcardContent = async (name: string) => {
        setSelectedWildcard(name);
        try {
            const res = await fetch(`/api/comfyui/wildcards?name=${encodeURIComponent(name)}`);
            const data = await res.json();
            if (data.success) {
                setWildcardContent(data);
            }
        } catch (err) {
            console.error('Failed to load wildcard:', err);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getRandomPrompt = () => {
        if (wildcardContent && wildcardContent.lines.length > 0) {
            const randomIndex = Math.floor(Math.random() * wildcardContent.lines.length);
            return wildcardContent.lines[randomIndex];
        }
        return null;
    };

    const filteredWildcards = wildcards.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLines = wildcardContent?.lines.filter(line =>
        line.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎲</div>
                    <p>Loading wildcards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h2>Wildcards Not Found</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <p style={{ marginTop: '16px', fontSize: '14px' }}>
                    Set <code>COMFYUI_WILDCARDS_PATH</code> in your .env.local file
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    🎲 Wildcards Manager
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Browse and manage your ComfyUI Impact Pack wildcards • {wildcards.length} wildcards available
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder={selectedWildcard ? "Search prompts..." : "Search wildcards..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                    }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedWildcard ? '300px 1fr' : '1fr', gap: '24px' }}>
                {/* Sidebar - Wildcard List */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '16px',
                    height: 'fit-content',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                        📁 Wildcards ({filteredWildcards.length})
                    </h2>

                    {!selectedWildcard ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                            {filteredWildcards.map((wildcard) => (
                                <button
                                    key={wildcard.name}
                                    onClick={() => { loadWildcardContent(wildcard.name); setSearchTerm(''); }}
                                    style={{
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'white',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                                        {wildcard.name.toLowerCase().includes('emily') ? '👱‍♀️' :
                                            wildcard.name.toLowerCase().includes('juna') ? '👩‍🦰' : '📄'}
                                    </div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>
                                        {wildcard.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {wildcard.lineCount} prompts
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => { setSelectedWildcard(null); setWildcardContent(null); setSearchTerm(''); }}
                                style={{
                                    padding: '8px 12px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                }}
                            >
                                ← Back to all
                            </button>
                            {filteredWildcards.map((wildcard) => (
                                <button
                                    key={wildcard.name}
                                    onClick={() => { loadWildcardContent(wildcard.name); setSearchTerm(''); }}
                                    style={{
                                        padding: '12px',
                                        background: selectedWildcard === wildcard.name ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'white',
                                        fontSize: '13px',
                                    }}
                                >
                                    {wildcard.name.toLowerCase().includes('emily') ? '👱‍♀️ ' :
                                        wildcard.name.toLowerCase().includes('juna') ? '👩‍🦰 ' : '📄 '}
                                    {wildcard.name} ({wildcard.lineCount})
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content - Wildcard Details */}
                {selectedWildcard && wildcardContent && (
                    <div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '16px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                                        {wildcardContent.name.toLowerCase().includes('emily') ? '👱‍♀️ ' :
                                            wildcardContent.name.toLowerCase().includes('juna') ? '👩‍🦰 ' : '📄 '}
                                        {wildcardContent.name}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        {wildcardContent.count} prompts • Use <code>__wildcards/{wildcardContent.name}__</code> in ComfyUI
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const prompt = getRandomPrompt();
                                        if (prompt) {
                                            navigator.clipboard.writeText(prompt);
                                            alert('Random prompt copied!');
                                        }
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '12px 24px' }}
                                >
                                    🎲 Copy Random Prompt
                                </button>
                            </div>
                        </div>

                        {/* Prompts List */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '16px',
                            maxHeight: '60vh',
                            overflowY: 'auto',
                        }}>
                            <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Showing {filteredLines.length} of {wildcardContent.lines.length} prompts
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredLines.slice(0, 100).map((line, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            fontSize: '13px',
                                            lineHeight: '1.5',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                        }}
                                    >
                                        <div style={{ flex: 1, wordBreak: 'break-word' }}>
                                            <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>#{index + 1}</span>
                                            {line.length > 200 ? line.substring(0, 200) + '...' : line}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(line, index)}
                                            style={{
                                                padding: '4px 8px',
                                                background: copiedIndex === index ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: copiedIndex === index ? '#22c55e' : 'white',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {copiedIndex === index ? '✓ Copied' : '📋 Copy'}
                                        </button>
                                    </div>
                                ))}
                                {filteredLines.length > 100 && (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ... and {filteredLines.length - 100} more prompts
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
