'use client';

import { useState } from 'react';

export default function VramPurger() {
    const [status, setStatus] = useState<'idle' | 'cleaning' | 'done'>('idle');

    const handlePurge = async () => {
        if (status === 'cleaning') return;
        setStatus('cleaning');
        try {
            const res = await fetch('/api/system/purge-vram', { method: 'POST' });
            const data = await res.json();
            console.log('Purge Report:', data.report);
            setStatus('done');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    return (
        <button
            onClick={handlePurge}
            title="Clear VRAM (Unload Ollama Models)"
            style={{
                background: status === 'done' ? 'rgba(16, 185, 129, 0.2)' : (status === 'cleaning' ? 'rgba(245, 158, 11, 0.2)' : 'transparent'),
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '0 12px',
                height: '40px', // Match tab height usually
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: status === 'done' ? '#6ee7b7' : (status === 'cleaning' ? '#fcd34d' : '#9ca3af'),
                transition: 'all 0.2s',
                marginLeft: 'auto' // Push to right if in flex container
            }}
        >
            <span style={{ fontSize: '16px' }}>
                {status === 'cleaning' ? '♻️' : (status === 'done' ? '✅' : '🧹')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {status === 'cleaning' ? 'Purging...' : (status === 'done' ? 'Cleaned' : 'Free VRAM')}
            </span>
        </button>
    );
}
