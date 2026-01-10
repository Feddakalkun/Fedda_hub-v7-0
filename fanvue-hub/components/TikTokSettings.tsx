'use client';

import { useEffect, useState } from 'react';
import { TikTokConnectButton } from './TikTokConnectButton';

export function TikTokSettings({ characterSlug }: { characterSlug: string }) {
    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function checkConnection() {
        try {
            if (!characterSlug) return;
            const response = await fetch(`/api/characters/${characterSlug}/tiktok`);
            const data = await response.json();

            if (data.connected) {
                setConnected(true);
                setAccount(data.account);
            } else {
                setConnected(false);
                setAccount(null);
            }
        } catch (error) {
            console.error('Failed to check connection:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
        checkConnection();
    }, [characterSlug]);

    if (loading) {
        return <p style={{ color: '#888' }}>Loading TikTok settings...</p>;
    }

    return (
        <div className="tiktok-settings" style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginTop: '20px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>🎵</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>TikTok Integration</h3>
                </div>
                {connected && <span style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                }}>✅ Connected</span>}
            </div>

            {connected && account ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    marginBottom: '16px'
                }}>
                    {account.tiktokAvatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={account.tiktokAvatar}
                            alt={account.tiktokUsername}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%'
                            }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <p style={{
                            margin: '0 0 4px 0',
                            fontWeight: '600',
                            fontSize: '16px'
                        }}>
                            @{account.tiktokUsername}
                        </p>
                        <p style={{
                            margin: '0',
                            color: '#888',
                            fontSize: '14px'
                        }}>
                            {account.tiktokDisplayName}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            // Disconnect TikTok
                            if (!confirm('Are you sure you want to disconnect TikTok?')) return;

                            fetch(`/api/characters/${characterSlug}/tiktok`, { method: 'DELETE' })
                                .then(() => {
                                    setConnected(false);
                                    setAccount(null);
                                });
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        🔌 Disconnect
                    </button>
                </div>
            ) : (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <p style={{
                        margin: '0 0 16px 0',
                        color: '#ccc',
                        fontSize: '14px'
                    }}>
                        Connect your TikTok account to automatically post generated videos.
                    </p>
                    <TikTokConnectButton
                        characterSlug={characterSlug}
                        onSuccess={() => {
                            // Refresh connection status when user connects
                            setTimeout(checkConnection, 1000);
                        }}
                    />
                </div>
            )}

            {connected && (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>⚙️ Auto-Posting</h4>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        fontSize: '14px'
                    }}>
                        <input type="checkbox" defaultChecked={account?.autoPostEnabled} />
                        <span>Auto-post generated videos to TikTok</span>
                    </label>

                    <div style={{ marginTop: '12px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#888'
                        }}>
                            Default Caption
                        </label>
                        <textarea
                            placeholder="e.g., Generated with AI ✨ #viral #ai"
                            defaultValue={account?.defaultCaption}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: '#111',
                                color: 'white',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                fontFamily: 'inherit',
                                fontSize: '14px',
                                resize: 'vertical',
                                minHeight: '80px'
                            }}
                        />
                    </div>

                    <button style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                    }}>
                        💾 Save Settings
                    </button>
                </div>
            )}
        </div>
    );
}
