'use client';

import { useState, useEffect } from 'react';

export function GlobalConfigSettings() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        clientId: '',
        clientSecret: '',
        geminiApiKey: '',
        falApiKey: '',
        elevenLabsApiKey: '',
        comfyuiUrl: 'http://127.0.0.1:8188'
    });

    useEffect(() => {
        // Load existing config from /api/setup
        fetch('/api/setup')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setForm(prev => ({
                        ...prev,
                        ...data.config,
                    }));
                }
                setLoading(false);
            })
            .catch(e => {
                console.error("Failed to load setup config", e);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        // Clean form data: Don't send masked values back if they contain '••••' (unchanged)
        const payload: any = {};
        Object.keys(form).forEach(key => {
            const val = (form as any)[key];
            if (val && !val.toString().startsWith('••••')) {
                payload[key] = val;
            }
        });

        if (Object.keys(payload).length === 0) {
            alert('No changes to save.');
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert('Configuration saved successfully!');
            } else {
                setError(data.error || 'Setup failed');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        outline: 'none'
    };

    if (loading) return null;

    return (
        <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px' }}>⚙️</div>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>System Configuration</h2>
                    <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                        Configure API keys and integrations.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>

                {/* Fanvue */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#60a5fa' }}>🔌 Fanvue Integration</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>OAuth Client ID</label>
                            <input
                                name="clientId" value={form.clientId} onChange={handleChange}
                                placeholder="b4e01fff-..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>OAuth Client Secret</label>
                            <input
                                name="clientSecret" value={form.clientSecret} onChange={handleChange}
                                type="password" placeholder="••••••••"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* AI Services */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f472b6' }}>🧠 AI Services</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>Gemini API Key (LLM)</label>
                            <input
                                name="geminiApiKey" value={form.geminiApiKey} onChange={handleChange}
                                type="password" placeholder="AIza..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>Fal.ai API Key (Image Gen)</label>
                            <input
                                name="falApiKey" value={form.falApiKey} onChange={handleChange}
                                type="password" placeholder="key-..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>ElevenLabs API Key (Voice)</label>
                            <input
                                name="elevenLabsApiKey" value={form.elevenLabsApiKey} onChange={handleChange}
                                type="password" placeholder="03f..."
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Local Services */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#34d399' }}>🖥️ Local Services</h3>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#aaa' }}>ComfyUI URL</label>
                        <input
                            name="comfyuiUrl" value={form.comfyuiUrl} onChange={handleChange}
                            placeholder="http://127.0.0.1:8188"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                        padding: '12px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        width: 'fit-content',
                        marginTop: '8px'
                    }}
                >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>
        </div>
    );
}
