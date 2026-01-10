export default function ElevenLabsPage() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>ElevenLabs Voice Synthesis</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Clone and synthesize character voices with realistic AI speech
            </p>

            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎙️</div>
                <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    ElevenLabs integration for character voice cloning and synthesis
                </p>
            </div>
        </div>
    );
}
