'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface FanvueProfile {
    displayName: string;
    handle: string;
    bio: string;
    avatarUrl?: string;
    isCreator: boolean;
    contentCounts?: {
        postCount?: number;
        videoCount?: number;
        imageCount?: number;
    };
    fanCounts?: {
        followersCount?: number;
        subscribersCount?: number;
    };
}

function FanvueContent() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [profile, setProfile] = useState<FanvueProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');
    const success = searchParams?.get('success');

    useEffect(() => {
        // Always check if connected by fetching profile
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/fanvue/profile');
            if (response.ok) {
                const data = await response.json();
                if (data.profile) {
                    setProfile(data.profile);
                    setIsConnected(true);
                    console.log('[Fanvue] Connected as:', data.profile.displayName);
                } else {
                    setIsConnected(false);
                }
            } else {
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = () => {
        setIsConnecting(true);
        window.location.href = '/api/auth/login';
    };

    const handleDisconnect = async () => {
        // Clear cookies and refresh
        document.cookie = 'fanvue_access_token=; Max-Age=0; path=/';
        document.cookie = 'fanvue_refresh_token=; Max-Age=0; path=/';
        setIsConnected(false);
        setProfile(null);
        window.location.href = '/fanvue';
    };

    if (isLoading) {
        return (
            <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Fanvue Publishing</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Loading your Fanvue connection...
                </p>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Fanvue Publishing</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Publish your generated content to Fanvue and manage your audience
            </p>

            {error && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fca5a5'
                }}>
                    <strong>OAuth Error:</strong> {error}
                    <br />
                    <small>Check the browser console and server logs for details.</small>
                </div>
            )}

            {success && !isConnected && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#86efac'
                }}>
                    <strong>✅ Success!</strong> Your Fanvue account is now connected.
                </div>
            )}

            {isConnected && profile ? (
                <div>
                    {/* Connected Account Card */}
                    <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                fontWeight: '700',
                            }}>
                                {profile.displayName.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                                    {profile.displayName}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    @{profile.handle}
                                </p>
                                {profile.isCreator && (
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '12px',
                                        color: '#86efac',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}>
                                        ✓ Verified Creator
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="btn btn-secondary"
                                style={{ alignSelf: 'flex-start' }}
                            >
                                Disconnect
                            </button>
                        </div>

                        {profile.bio && (
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                marginBottom: '24px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '8px',
                            }}>
                                {profile.bio}
                            </p>
                        )}

                        {(profile.contentCounts || profile.fanCounts) && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '16px'
                            }}>
                                {profile.contentCounts?.postCount !== undefined && (
                                    <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-purple)' }}>
                                            {profile.contentCounts.postCount}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Posts</div>
                                    </div>
                                )}
                                {profile.contentCounts?.videoCount !== undefined && (
                                    <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-pink)' }}>
                                            {profile.contentCounts.videoCount}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Videos</div>
                                    </div>
                                )}
                                {profile.fanCounts?.subscribersCount !== undefined && (
                                    <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                                            {profile.fanCounts.subscribersCount}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Subscribers</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Publishing Tools - Coming Soon */}
                    <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Publishing Tools Coming Soon</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                            Create posts, upload media, and schedule content directly to your Fanvue profile
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginTop: '32px'
                        }}>
                            <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Create Posts</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Text, images, videos</div>
                            </div>
                            <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Schedule</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Auto-publish later</div>
                            </div>
                            <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Analytics</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Track engagement</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Connect Your Fanvue Account</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Authorize this app to publish content and manage your Fanvue profile
                    </p>

                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="btn btn-primary"
                        style={{
                            fontSize: '16px',
                            padding: '16px 32px',
                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                            opacity: isConnecting ? 0.6 : 1
                        }}
                    >
                        {isConnecting ? 'Connecting...' : '🔗 Connect with Fanvue'}
                    </button>

                    <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        <p>This will redirect you to Fanvue to authorize the app.</p>
                        <p>You'll be redirected back here after authorization.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FanvuePage() {
    return (
        <Suspense fallback={
            <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Fanvue Publishing</h2>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                </div>
            </div>
        }>
            <FanvueContent />
        </Suspense>
    );
}
