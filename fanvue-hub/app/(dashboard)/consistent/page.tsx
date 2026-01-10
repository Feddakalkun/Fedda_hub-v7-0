'use client';

import Link from 'next/link';

export default function ConsistentCharacterPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in-out' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎯 Consistent Character System
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '48px' }}>
                The proven method used by successful AI influencers
            </p>

            {/* The Actual Working Method */}
            <div className="glass-card" style={{ padding: '48px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
                    How to Use Your Character LoRAs
                </h2>

                <div style={{ display: 'grid', gap: '32px' }}>
                    {/* Step 1 */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>1</div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                                Go to ComfyUI Generator
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                You already have 20+ character LoRAs ready! Head to the ComfyUI tab to start using them.
                            </p>
                            <Link href="/comfyui" className="btn btn-primary">
                                Open ComfyUI Generator →
                            </Link>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>2</div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                                Add Your Character LoRA
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                In the <strong>🎨 LoRA Mixer</strong> section:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
                                <li>Click <strong>"+ Add LoRA"</strong></li>
                                <li>Select your character LoRA from the dropdown</li>
                                <li>Set strength to <strong>1.0</strong> for maximum consistency</li>
                                <li>Optional: Add style LoRAs for unique looks</li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>3</div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                                Use Viral Scenarios
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                Click <strong>🔥 Viral Scenario</strong> and pick from:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                                {['Gym Mirror Selfie', 'Morning Coffee', 'Beach Sunset', 'Luxury Date Night', 'Cozy Gamer', 'Street Fashion', 'Bed Selfie', 'Office Chic'].map((s, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        • {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>4</div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                                Generate & Post
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                Click <strong>🎨 Generate Image</strong> and watch the magic happen!
                            </p>
                            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                                <p style={{ color: '#86efac', marginBottom: '8px' }}>
                                    <strong>✅ Same face, every time!</strong>
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Your character LoRA ensures perfect consistency. Then use <strong>"📸 Post to Fanvue"</strong> to publish instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pro Tips */}
            <div className="glass-card" style={{ padding: '32px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: 'var(--accent-purple)' }}>
                    💡 Pro Tips for Your 20+ Characters
                </h3>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '2' }}>
                    <li><strong>Test each LoRA:</strong> Generate 1 image per character to verify they all work</li>
                    <li><strong>Save favorites:</strong> Use "💾 Save Current" to save your best character + scenario combos</li>
                    <li><strong>Mix LoRAs:</strong> Stack character LoRA (1.0) + style LoRA (0.5-0.8) for unique aesthetics</li>
                    <li><strong>Batch generate:</strong> Pick 1 character, generate 10 scenarios, post daily = viral growth</li>
                    <li><strong>Portrait mode:</strong> Use "Portrait (9:16 Fanvue)" for mobile-optimized content</li>
                </ul>
            </div>

            {/* Quick Start */}
            <div className="glass-card" style={{ padding: '48px', marginTop: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                    You're Ready to Go Viral!
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '18px' }}>
                    With 20+ character LoRAs, you can create a whole agency of AI influencers.
                </p>
                <Link href="/comfyui" className="btn btn-primary" style={{ fontSize: '20px', padding: '20px 64px' }}>
                    🎨 Start Creating →
                </Link>
            </div>
        </div>
    );
}
