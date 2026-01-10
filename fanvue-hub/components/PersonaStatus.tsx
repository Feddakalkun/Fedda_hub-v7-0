import { useEffect, useState } from 'react';

interface PersonaStatusProps {
    persona: 'emily' | 'thale';
    personaName: string;
    personaColor: string;
}

export default function PersonaStatus({ persona, personaName, personaColor }: PersonaStatusProps) {
    const [status, setStatus] = useState<{
        fanvue: boolean;
        fanvueHandle?: string;
        x: boolean;
        xHandle?: string;
    }>({
        fanvue: false,
        x: false
    });

    useEffect(() => {
        checkStatus();
    }, [persona]);

    const checkStatus = async () => {
        try {
            const response = await fetch(`/api/fanvue/profile?persona=${persona}`);
            if (response.ok) {
                const data = await response.json();
                setStatus(prev => ({
                    ...prev,
                    fanvue: !!data.profile,
                    fanvueHandle: data.profile?.handle
                }));
            }
        } catch (err) {
            console.error(`[${personaName}] Failed to check connection status:`, err);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 100,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${personaColor}44`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minWidth: '200px'
        }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {personaName} Status
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Fanvue Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span>🚀</span>
                        <span>Fanvue</span>
                    </div>
                    {status.fanvue ? (
                        <span style={{
                            padding: '2px 6px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                        }}>
                            ● {status.fanvueHandle ? `@${status.fanvueHandle}` : 'OK'}
                        </span>
                    ) : (
                        <a
                            href="/accounts"
                            style={{
                                padding: '2px 6px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            ○ SETUP
                        </a>
                    )}
                </div>

                {/* X Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: 0.5 }}>
                        <span>𝕏</span>
                        <span>X</span>
                    </div>
                    <span style={{
                        padding: '2px 6px',
                        background: 'rgba(100, 100, 100, 0.2)',
                        color: '#999',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                    }}>
                        SOON
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <a
                    href="/accounts"
                    style={{
                        fontSize: '11px',
                        color: personaColor,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'center'
                    }}
                >
                    <span>⚙️</span>
                    <span>Manage Accounts</span>
                </a>
            </div>
        </div>
    );
}
