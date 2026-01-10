'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [form, setForm] = useState({
        clientId: '',
        clientSecret: '',
        geminiApiKey: '',
        falApiKey: '',
        elevenLabsApiKey: '',
        comfyuiUrl: 'http://127.0.0.1:8188'
    });

    useEffect(() => {
        // Load existing config
        fetch('/api/setup')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setForm(prev => ({
                        ...prev,
                        ...data.config,
                        // Secrets might be masked or partial, that's fine for display
                        // If they are masked (e.g. ••••), we should validly handle them (only send back if changed)
                        // But for now, simple overwrite logic in API handles strictly provided keys.
                        // Actually, if we send back '••••', the API should probably ignore it?
                        // For simplicity, let's assume user re-enters secrets if they want to change them, 
                        // or we rely on the API to NOT clear them if we send empty string?
                        // My API update logic was `...(clientId && { clientId })`. So empty string = no update.
                        // So we should initialize masked values to empty string? No, then user thinks they are empty.
                        // Let's keep them as masked string, and handle masking check in submit.
                    }));
                }
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
            // Nothing changed?
            // Force save at least one field if we want to "complete setup"?
            // Or just redirect.
            router.push('/characters');
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
                router.push('/characters');
            } else {
                setError(data.error || 'Setup failed');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading System...</div>;

    return (
        <div style={{
            maxWidth: '800px',
            margin: '40px auto',
            padding: '40px',
            background: 'linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95))',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{
                    fontSize: '32px', fontWeight: 'bold', marginBottom: '8px',
                    background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    System Configuration
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Configure your distribution environment variables
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>

                {/* 1. FANVUE INTEGRATION */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#60a5fa', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        🔌 Fanvue Integration
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>OAuth Client ID</label>
                            <input
                                name="clientId" value={form.clientId} onChange={handleChange}
                                placeholder="b4e01fff-..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>OAuth Client Secret</label>
                            <input
                                name="clientSecret" value={form.clientSecret} onChange={handleChange}
                                type="password" placeholder="••••••••"
                                style={inputStyle}
                            />
                            <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '6px' }}>
                                Redirect URI: <code>https://localhost:3001/api/auth/callback</code>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. AI SERVICES */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#f472b6', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        🧠 AI Services
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Gemini API Key (LLM)</label>
                            <input
                                name="geminiApiKey" value={form.geminiApiKey} onChange={handleChange}
                                type="password" placeholder="AIza..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Fal.ai API Key (Image Gen)</label>
                            <input
                                name="falApiKey" value={form.falApiKey} onChange={handleChange}
                                type="password" placeholder="key-..."
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>ElevenLabs API Key (Voice)</label>
                            <input
                                name="elevenLabsApiKey" value={form.elevenLabsApiKey} onChange={handleChange}
                                type="password" placeholder="03f..."
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </section>

                {/* 3. LOCAL SERVICES */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#34d399', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        🖥️ Local Services
                    </h3>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>ComfyUI URL</label>
                        <input
                            name="comfyuiUrl" value={form.comfyuiUrl} onChange={handleChange}
                            placeholder="http://127.0.0.1:8188"
                            style={inputStyle}
                        />
                    </div>
                </section>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    {isSaving ? 'Saving Configuration...' : 'Save Configuration'}
                </button>
            </form>
        </div>
    );
}

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
