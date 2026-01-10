'use client';

import { useState, useEffect } from 'react';

export default function MassDMPage() {
    const [content, setContent] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState(5); // Default $5
    const [isSubscriberOnly, setIsSubscriberOnly] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    // Initial load from local storage (shared with Emily page)
    useEffect(() => {
        const stored = localStorage.getItem('emily_content');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Filter only "Spicy" or "PPV" content for this tool primarily
            const spicyContent = parsed.filter((c: any) =>
                ['spicy', 'ppv'].includes(c.mood || ''));
            setContent(spicyContent.length > 0 ? spicyContent : parsed); // Fallback to all if no spicy
        }

        // Default message templates
        setMessage("Hey baby... I was thinking about you while taking this 🙈 Want to see the rest?");
    }, []);

    const handleSend = async () => {
        if (!selectedImage && !message) {
            alert("Please select an image or write a message!");
            return;
        }

        if (!confirm(`Are you sure you want to BLAST this message to ALL subscribers for $${price}?`)) {
            return;
        }

        setIsSending(true);
        setStatus('Initializing blast...');

        try {
            const filename = selectedImage ? selectedImage.imageUrl.split('filename=')[1].split('&')[0] : null;

            const res = await fetch('/api/fanvue/mass-dm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    filename,
                    price
                })
            });

            const data = await res.json();

            if (data.success) {
                setStatus(`✅ Success! Sent to ${data.results.successful} subs. (Failed: ${data.results.failed})`);
                alert('Mass DM Blast Complete! 💸');
            } else {
                setStatus(`❌ Error: ${data.error}`);
            }

        } catch (e: any) {
            setStatus(`❌ Critical Error: ${e.message}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    💸 Mass DM Blaster
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Monetize your content instantly. Send locked PPV messages to all subscribers.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>

                {/* LEFT: Content Picker */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>1. Select Content</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '12px',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        paddingRight: '8px'
                    }}>
                        {content.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: selectedImage?.id === item.id ? '3px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    aspectRatio: '2/3'
                                }}
                            >
                                <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    padding: '8px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    fontSize: '10px'
                                }}>
                                    {item.scene}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Campaign Settings */}
                <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>2. Campaign Settings</h3>

                    {/* Validated Preview */}
                    {selectedImage && (
                        <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={selectedImage.imageUrl} style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
                        </div>
                    )}

                    {/* Message Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Message Caption
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{
                                width: '100%',
                                height: '100px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '12px',
                                fontSize: '14px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    {/* Price Input */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Price ($ USD)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ padding: '12px', color: 'var(--text-secondary)' }}>$</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    width: '100%',
                                    padding: '12px 0',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            🔥 Potential Earnings: ${(price * 100).toLocaleString()} (if 100 people unlock)
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSend}
                        disabled={isSending || (!selectedImage && !message)}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            opacity: isSending ? 0.7 : 1
                        }}
                    >
                        {isSending ? '🚀 BLASTING MESSAGES...' : `💸 SEND CAMPAIGN ($${price})`}
                    </button>

                    {status && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px' }}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
