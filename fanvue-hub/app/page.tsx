'use client';

import Link from 'next/link';

export default function LandingPage() {
    return (
        <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.6, // Faded effect
                    filter: 'grayscale(100%) contrast(1.2)' // Cinematic look? Or natural? User said "faded black".
                }}
            >
                <source src="/bg.mp4" type="video/mp4" />
            </video>

            {/* Overlay Gradient for Text Readability */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                zIndex: 1
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

                {/* Logo / Header */}
                <div>
                    <h1 style={{
                        fontSize: '64px',
                        fontWeight: '800',
                        letterSpacing: '0.15em',
                        margin: 0,
                        textTransform: 'uppercase',
                        background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        FEDDAKALKUN
                    </h1>
                    <h2 style={{
                        marginTop: '-10px',
                        fontSize: '24px',
                        fontWeight: '300',
                        letterSpacing: '0.5em',
                        color: '#666',
                        textTransform: 'uppercase'
                    }}>
                        WORKSTATION
                    </h2>
                </div>

                {/* Subtitle / Slogan */}
                <div style={{ position: 'relative', padding: '0 20px' }}>
                    <p style={{
                        fontSize: '16px',
                        letterSpacing: '0.3em',
                        color: '#f0f0f0',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                    }}>
                        ONE UI TO RULE IT ALL
                    </p>
                    <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #fff, transparent)', opacity: 0.5 }} />
                </div>

                {/* CTA Button */}
                <Link href="/characters">
                    <button style={{
                        marginTop: '40px',
                        padding: '16px 48px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        fontSize: '14px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '2px'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Enter Studio
                    </button>
                </Link>

            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '32px', zIndex: 10, opacity: 0.4, fontSize: '10px', letterSpacing: '0.2em' }}>
                AUTOMATED CONTENT GENERATION & SCHEDULING
            </div>

        </main>
    );
}
