'use client';

import { useState, useEffect } from 'react';
import SMSChat from '@/components/SMSChat';
import PhoneCall from '@/components/PhoneCall';

interface Character {
    id: string;
    name: string;
    slug: string;
    handle?: string;
    avatarUrl?: string;
    bio?: string;
}

type AppView = 'home' | 'contacts' | 'messages' | 'call';

export default function PhonePage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<AppView>('home');
    const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const res = await fetch('/api/characters');
            const data = await res.json();
            if (data.success) {
                setCharacters(data.characters);
            }
        } catch (e) {
            console.error('Failed to load characters:', e);
        } finally {
            setLoading(false);
        }
    };

    // Render Messages app (SMS)
    if (currentView === 'messages') {
        return (
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{
                    position: 'relative',
                    width: '400px',
                    height: '800px',
                    background: 'white',
                    borderRadius: '50px',
                    border: '14px solid #1a1a1a',
                    boxShadow: '0 0 0 3px #2a2a2a, 0 25px 80px rgba(0,0,0,0.9)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '130px',
                        height: '30px',
                        background: '#000',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px',
                        zIndex: 50
                    }} />

                    <div style={{
                        padding: '12px 32px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#000'
                    }}>
                        <span style={{ fontWeight: '600' }}>9:41</span>
                        <div>📶 🔋</div>
                    </div>

                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <button onClick={() => setCurrentView('home')} style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                                ← Home
                            </button>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Messages</h1>
                            <button style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '24px', cursor: 'pointer' }}>✎</button>
                        </div>
                    </div>

                    <div style={{ height: 'calc(100% - 160px)', overflowY: 'auto' }}>
                        {characters.map((char) => (
                            <button
                                key={char.id}
                                onClick={() => {
                                    setActiveCharacter(char);
                                    setCurrentView('call');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden', flexShrink: 0 }}>
                                    {char.avatarUrl ? (
                                        <img src={char.avatarUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        char.name.charAt(0)
                                    )}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontWeight: '600', color: '#000' }}>{char.name}</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>Send a message...</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '130px', height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }} />
                </div>
            </div>
        );
    }

    // Render Contacts app
    if (currentView === 'contacts') {
        return (
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{
                    position: 'relative',
                    width: '400px',
                    height: '800px',
                    background: 'white',
                    borderRadius: '50px',
                    border: '14px solid #1a1a1a',
                    boxShadow: '0 0 0 3px #2a2a2a, 0 25px 80px rgba(0,0,0,0.9)',
                    overflow: 'hidden'
                }}>
                    {/* Notch */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '130px',
                        height: '30px',
                        background: '#000',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px',
                        zIndex: 50
                    }} />

                    {/* Status Bar */}
                    <div style={{
                        padding: '12px 32px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#000'
                    }}>
                        <span style={{ fontWeight: '600' }}>9:41</span>
                        <div>📶 🔋</div>
                    </div>

                    {/* Header */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e5e5'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <button
                                onClick={() => setCurrentView('home')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007AFF',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Home
                            </button>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Contacts</h1>
                            <div style={{ width: '64px' }} />
                        </div>
                        <input
                            type="search"
                            placeholder="Search"
                            style={{
                                width: '100%',
                                padding: '8px 16px',
                                background: '#f0f0f0',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Contacts List */}
                    <div style={{ height: 'calc(100% - 160px)', overflowY: 'auto' }}>
                        {characters.map((char) => (
                            <button
                                key={char.id}
                                onClick={() => {
                                    setActiveCharacter(char);
                                    setCurrentView('call');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: '#ddd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {char.avatarUrl ? (
                                        <img src={char.avatarUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        char.name.charAt(0)
                                    )}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontWeight: '600', color: '#000' }}>{char.name}</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>{char.handle || 'AI Companion'}</div>
                                </div>
                                <div style={{ color: '#007AFF', fontSize: '20px' }}>📞</div>
                            </button>
                        ))}
                    </div>

                    {/* Home Indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '130px',
                        height: '4px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '10px'
                    }} />
                </div>
            </div>
        );
    }

    // Render active call
    if (currentView === 'call' && activeCharacter) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{
                    position: 'relative',
                    width: '400px',
                    height: '800px',
                    background: '#000',
                    borderRadius: '50px',
                    border: '14px solid #1a1a1a',
                    boxShadow: '0 0 0 3px #2a2a2a, 0 25px 80px rgba(0,0,0,0.9)',
                    overflow: 'hidden'
                }}>
                    {/* Notch */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '130px',
                        height: '30px',
                        background: '#000',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px',
                        zIndex: 50
                    }} />

                    {/* Status Bar */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: '12px 32px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#fff',
                        zIndex: 40
                    }}>
                        <span style={{ fontWeight: '600' }}>9:41</span>
                        <div>📶 🔋</div>
                    </div>

                    <PhoneCall
                        character={activeCharacter}
                        onHangup={() => {
                            setCurrentView('contacts'); // Go back to contacts after hangup, or home
                            setActiveCharacter(null);
                        }}
                    />

                    {/* Home Indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '130px',
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: '10px'
                    }} />
                </div>
            </div>
        );
    }

    // Home Screen
    return (
        <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
                position: 'relative',
                width: '400px',
                height: '800px',
                borderRadius: '50px',
                border: '14px solid #1a1a1a',
                boxShadow: '0 0 0 3px #2a2a2a, 0 25px 80px rgba(0,0,0,0.9)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                overflow: 'hidden'
            }}>
                {/* Notch */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '130px',
                    height: '30px',
                    background: '#000',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                    zIndex: 50
                }} />

                {/* Status Bar */}
                <div style={{
                    padding: '12px 32px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#fff'
                }}>
                    <span style={{ fontWeight: '600' }}>9:41</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📶</span>
                        <span>🔋</span>
                    </div>
                </div>

                {/* Time Widget */}
                <div style={{ padding: '48px 32px', color: '#fff' }}>
                    <div style={{ fontSize: '64px', fontWeight: '200' }}>9:41</div>
                    <div style={{ fontSize: '20px', fontWeight: '500', marginTop: '8px' }}>Wednesday, Jan 8</div>
                </div>

                {/* App Grid */}
                <div style={{
                    padding: '24px 32px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px'
                }}>
                    {/* Contacts */}
                    <button
                        onClick={() => setCurrentView('contacts')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s'
                        }}>
                            👤
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            Contacts
                        </span>
                    </button>

                    {/* Messages */}
                    <button
                        onClick={() => setCurrentView('messages')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s'
                        }}>
                            💬
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            Messages
                        </span>
                    </button>

                    {/* Gallery (coming soon) */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.3
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            🖼️
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            Photos
                        </span>
                    </div>

                    {/* Settings (disabled) */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.4
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            ⚙️
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            Settings
                        </span>
                    </div>
                </div>

                {/* Dock */}
                <div style={{
                    position: 'absolute',
                    bottom: '32px',
                    left: '32px',
                    right: '32px'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            📞
                        </div>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            🎵
                        </div>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            🌐
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '130px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '10px'
                }} />
            </div>
        </div>
    );
}
