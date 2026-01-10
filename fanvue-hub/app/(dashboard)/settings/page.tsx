'use client';

import { useState, useEffect } from 'react';
import { TikTokSettings } from '@/components/TikTokSettings';
import { OllamaManager } from '@/components/OllamaManager';
import { GlobalConfigSettings } from '@/components/GlobalConfigSettings';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [config, setConfig] = useState<any>({});
    const [characters, setCharacters] = useState<any[]>([]);

    useEffect(() => {
        // Load characters to know which one to connect
        const loadData = async () => {
            try {
                const res = await fetch('/api/characters');
                const data = await res.json();
                if (data.success) {
                    setCharacters(data.characters);
                }
            } catch (e) {
                console.error("Failed to load characters", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleConnectFanvue = () => {
        if (characters.length === 0) {
            alert("No character found. Please create a character first.");
            return;
        }
        // Default to the first character for now
        const slug = characters[0].slug;
        window.location.href = `/api/auth/fanvue?persona=${slug}`;
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading Settings...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Settings</h1>

            <div style={{ display: 'grid', gap: '24px' }}>

                {/* Fanvue Integration */}
                <div style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '32px' }}>💙</div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Fanvue Integration</h2>
                            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                                Connect <strong>{characters[0]?.name || 'your character'}</strong> to auto-post content.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConnectFanvue}
                        disabled={characters.length === 0}
                        style={{
                            padding: '12px 24px',
                            background: characters.length === 0 ? '#444' : '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: characters.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        Connect Fanvue Account
                    </button>
                </div>

                {/* TikTok Integration */}
                {characters.length > 0 && (
                    <TikTokSettings characterSlug={characters[0].slug} />
                )}

                {/* Ollama Models */}
                <OllamaManager />

                {/* System Status */}
                <div style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>System Status</h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <span style={{ color: '#ccc' }}>VoxCPM Engine</span>
                            <span style={{ color: '#4ade80' }}>● Detected</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <span style={{ color: '#ccc' }}>ComfyUI</span>
                            <span style={{ color: '#4ade80' }}>● Connected (localhost:8188)</span>
                        </div>
                    </div>
                </div>

                {/* Global Configuration (Replaces Setup Page) */}
                <GlobalConfigSettings />

            </div>
        </div>
    );
}
