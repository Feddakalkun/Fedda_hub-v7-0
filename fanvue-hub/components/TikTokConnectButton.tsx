'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TikTokConnectButtonProps {
    characterSlug: string;
    onSuccess?: () => void;
}

export function TikTokConnectButton({ characterSlug, onSuccess }: TikTokConnectButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    async function handleConnect() {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // If no character selected, warn user
        if (!characterSlug) {
            setError('No character selected');
            setLoading(false);
            return;
        }

        try {
            // Step 1: Open popup window (bypasses CSP)
            const width = 500;
            const height = 700;
            const left = window.innerWidth > width ? (window.innerWidth - width) / 2 : 0;
            const top = window.innerHeight > height ? (window.innerHeight - height) / 2 : 0;

            const popup = window.open(
                `/api/auth/tiktok?persona=${characterSlug}`,
                'tiktok_login',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,location=yes`
            );

            if (!popup) {
                setError('Popup blocked. Please allow popups for this site.');
                setLoading(false);
                return;
            }

            // Step 2: Poll for popup closure
            const pollInterval = setInterval(async () => {
                // Check if popup was closed
                if (popup.closed) {
                    clearInterval(pollInterval);

                    // Step 3: Wait a moment for backend to save data
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Step 4: Verify connection succeeded
                    try {
                        const response = await fetch(`/api/characters/${characterSlug}/tiktok`);
                        const data = await response.json();

                        if (data.connected) {
                            // ✅ Success! Show success message
                            setSuccess(true);

                            // Call callback if provided
                            onSuccess?.();

                            // Reload after 2 seconds so user sees the success state
                            setTimeout(() => {
                                router.refresh();
                                window.location.reload();
                            }, 2000);
                        } else {
                            // ❌ Connection check failed
                            setError('Connection check failed. Please try again.');
                            setLoading(false);
                        }
                    } catch (err) {
                        setError('Failed to verify connection. Please refresh the page.');
                        setLoading(false);
                    }
                }
            }, 500);

            // Timeout after 60 seconds
            setTimeout(() => {
                if (!popup.closed) {
                    popup.close();
                    clearInterval(pollInterval);
                    setError('Connection timeout. Please try again.');
                    setLoading(false);
                }
            }, 60000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
            setLoading(false);
        }
    }

    // Success state
    if (success) {
        return (
            <div style={{
                padding: '12px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500'
            }}>
                ✅ Connected! Reloading...
            </div>
        );
    }

    return (
        <div className="tiktok-connect">
            <button
                onClick={handleConnect}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    background: loading ? '#666' : '#fe2c55', // TikTok Brand Color
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s'
                }}
            >
                {loading ? '🔄 Connecting...' : '📱 Connect TikTok'}
            </button>
            {error && (
                <p style={{ marginTop: '8px', color: '#ff4444', fontSize: '13px' }}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
}
