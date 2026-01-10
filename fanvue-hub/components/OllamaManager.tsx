'use client';

import { useState, useEffect } from 'react';

const SUGGESTED_MODELS = [
    { name: 'dolphin-mixtral:latest', description: 'Dolphin Mixtral 8x7B. Excellent for creative/NSFW tasks.' },
    { name: 'huihui_ai/qwen3-abliterated:14b', description: 'Qwen3 14B (Uncensored). High quality reasoning & creative freedom.' },
    { name: 'mistral:latest', description: 'Mistral 7B. Fast, balanced, good for basic prompting.' },
    { name: 'llama3:latest', description: 'Llama 3 8B. Strong general purpose model.' },
    { name: 'llama3.3:70b', description: 'Llama 3.3 70B. Maximum intelligence (Requires 48GB+ VRAM).' },
    { name: 'aha2025/llama-joycaption-beta-one-hf-llava:Q8_0', description: 'JoyCaption Beta. Best Vision model for image analysis.' },
];

export function OllamaManager() {
    const [installedModels, setInstalledModels] = useState<any[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'pulling'>('loading');
    const [error, setError] = useState('');
    const [pullProgress, setPullProgress] = useState<{ model: string, status: string, percent: number } | null>(null);

    const fetchModels = async () => {
        try {
            const res = await fetch('/api/ollama/models');
            const data = await res.json();
            if (data.success) {
                setInstalledModels(data.models);
                setStatus('ready');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            console.error(err);
            setError("Ollama is not running. Please ensure 'run.bat' is active.");
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleDownload = async (modelName: string) => {
        setStatus('pulling');
        setPullProgress({ model: modelName, status: 'Starting...', percent: 0 });
        setError('');

        try {
            const response = await fetch('/api/ollama/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelName })
            });

            if (!response.ok) throw new Error('Failed to start download');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);

                        // Parse Ollama stream response
                        // {"status":"pulling manifest"}
                        // {"status":"downloading template","digest":"...","total":...,"completed":...}
                        // {"status":"success"}

                        let percent = 0;
                        if (json.total && json.completed) {
                            percent = Math.round((json.completed / json.total) * 100);
                        }

                        if (json.status === 'success') {
                            setPullProgress({ model: modelName, status: 'Complete!', percent: 100 });
                            setTimeout(() => {
                                setPullProgress(null);
                                setStatus('ready');
                                fetchModels(); // Refresh list
                            }, 2000);
                        } else {
                            setPullProgress({
                                model: modelName,
                                status: json.status,
                                percent: percent
                            });
                        }

                    } catch (e) {
                        // Ignore incomplete JSON chunks
                    }
                }
            }

        } catch (err: any) {
            setError(err.message);
            setStatus('ready'); // Revert to ready state but show error
            setPullProgress(null);
        }
    };

    const isInstalled = (name: string) => installedModels.some(m => m.name.startsWith(name));

    return (
        <div style={{
            padding: '24px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
                🦙 Ollama Model Manager
            </h3>

            {status === 'error' && (
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Pull Progress Overlay/Section */}
            {status === 'pulling' && pullProgress && (
                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>Downloading {pullProgress.model}...</span>
                        <span style={{ color: '#93c5fd' }}>{pullProgress.percent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pullProgress.percent}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                        Status: {pullProgress.status}
                    </div>
                </div>
            )}

            {/* Suggested Models */}
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {SUGGESTED_MODELS.map(model => {
                    const installed = isInstalled(model.name);
                    return (
                        <div key={model.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                    {model.name} {installed && <span style={{ fontSize: '12px', background: '#10b981', color: 'black', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>INSTALLED</span>}
                                </div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{model.description}</div>
                            </div>

                            {!installed && (
                                <button
                                    onClick={() => handleDownload(model.name)}
                                    disabled={status === 'pulling'}
                                    style={{
                                        padding: '8px 16px',
                                        background: status === 'pulling' ? '#555' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: status === 'pulling' ? 'not-allowed' : 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Download
                                </button>
                            )}
                            {installed && (
                                <button disabled style={{ padding: '8px 16px', background: 'transparent', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', opacity: 0.7 }}>
                                    Ready
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Manual Download & Search */}
            <div style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Custom Download</h4>
                    <a
                        href="https://ollama.com/search"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        Browse Models ↗
                    </a>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        placeholder="e.g. qwen:14b or gemma:7b"
                        id="custom-model-input"
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'black',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={() => {
                            const input = document.getElementById('custom-model-input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                                handleDownload(input.value.trim());
                                input.value = '';
                            }
                        }}
                        disabled={status === 'pulling'}
                        style={{
                            padding: '0 24px',
                            background: status === 'pulling' ? '#444' : '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: status === 'pulling' ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Pull
                    </button>
                </div>
            </div>

            {/* All Installed Models List */}
            {installedModels.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Also Installed
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {installedModels.filter(m => !SUGGESTED_MODELS.some(s => m.name.startsWith(s.name))).map((m: any) => (
                            <span key={m.name} style={{
                                padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '13px'
                            }}>
                                {m.name}
                            </span>
                        ))}
                        {installedModels.filter(m => !SUGGESTED_MODELS.some(s => m.name.startsWith(s.name))).length === 0 && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No other models found.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
