'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CharacterStudio() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Identity
        name: '',
        handle: '',
        bio: '',
        fanvueProfileId: '',
        fanvueSecret: '',

        // Appearance
        age: 22,
        height: 'Average (168cm)',
        bodyType: 'Athletic & Toned',
        breastSize: 'Medium (C)',
        hairColor: 'Blonde',
        hairStyle: 'Long & Wavy',
        eyeColor: 'Blue',
        skinTone: 'Fair & Natural',
        clothingStyle: 'Trendy & Casual',

        // LoRA Mixer (4 slots)
        loraSlots: [
            { path: '', strength: 1.0 },
            { path: '', strength: 0.5 },
            { path: '', strength: 0.5 },
            { path: '', strength: 0.5 }
        ],

        // Personality
        personality: [] as string[],
        llmModel: 'mistral',
        systemInstruction: '',

        // Voice
        voiceProvider: 'gemini',
        voiceModel: 'Puck', // Gemini default

        // Generated
        avatarPrompt: '',
        generatedAvatarUrl: ''
    });

    const [availableLoras, setAvailableLoras] = useState<string[]>([]);

    useEffect(() => {
        // Fetch LoRAs
        fetch('/api/models/loras')
            .then(res => res.json())
            .then(data => {
                if (data.success) setAvailableLoras(data.loras);
            })
            .catch(err => console.error('Failed to load LoRAs', err));
    }, []);

    const bodyTypes = ['Slim & Petite', 'Athletic & Toned', 'Curvy & Voluptuous', 'Tall & Model-esque', 'Average & Natural'];
    const hairColors = ['Blonde', 'Brunette', 'Black', 'Red', 'Pink', 'Silver', 'Ombre'];
    const eyeColors = ['Blue', 'Green', 'Brown', 'Hazel', 'Grey'];
    const personalities = ['Flirty', 'Intellectual', 'Playful', 'Dominant', 'Submissive', 'Funny', 'Caring', 'Mysterious'];

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const generateAppearancePrompt = () => {
        const prompt = `portrait of a ${formData.age} year old woman, ${formData.hairColor} ${formData.hairStyle} hair, ${formData.eyeColor} eyes, ${formData.bodyType} body, ${formData.breastSize} chest, ${formData.skinTone} skin, wearing ${formData.clothingStyle}, highly detailed, photorealistic, 8k`;
        setFormData(prev => ({ ...prev, avatarPrompt: prompt }));
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            // Save logic here (call API)
            // Ideally POST /api/characters/create

            // For now just mock it and redirect
            await new Promise(r => setTimeout(r, 1000));
            alert('Character Created! (Mock)');
            router.push('/characters');
        } catch (e) {
            alert('Error creating character');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '400', letterSpacing: '0.05em', marginBottom: '8px' }}>Character Studio</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Create your perfect AI persona step-by-step</p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px', gap: '20px' }}>
                {['Appearance', 'Identity', 'Personality', 'Voice', 'Review'].map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isActive || isCompleted ? 1 : 0.3 }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: isActive ? '#fff' : (isCompleted ? '#4ade80' : '#333'),
                                color: isActive ? '#000' : (isCompleted ? '#000' : '#888'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 'bold'
                            }}>
                                {isCompleted ? '✓' : stepNum}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                            {stepNum < 5 && <div style={{ width: '40px', height: '1px', background: '#333', marginLeft: '12px' }} />}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '60px' }}>
                {/* Main Form Area */}
                <div style={{ flex: 2 }}>

                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '8px', letterSpacing: '-0.02em' }}>Design Your Persona</h2>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>Define the visual DNA by mixing models and selecting physical traits.</p>

                            <div style={{ display: 'grid', gap: '40px' }}>

                                {/* LoRA DNA Mixer */}
                                <div style={{ background: 'rgba(56, 189, 248, 0.03)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '18px' }}>🧬</span>
                                        <h3 style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Model DNA Mixer</h3>
                                    </div>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {[0, 1, 2, 3].map(index => (
                                            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '24px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>#{index + 1}</div>
                                                <select
                                                    value={formData.loraSlots[index]?.path || ''}
                                                    onChange={e => {
                                                        const newSlots = [...formData.loraSlots];
                                                        newSlots[index] = { ...newSlots[index], path: e.target.value };
                                                        setFormData({ ...formData, loraSlots: newSlots });
                                                    }}
                                                    style={{ flex: 1, padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '13px' }}
                                                >
                                                    <option value="">Select Base Model / LoRA...</option>
                                                    {availableLoras.map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>

                                                <div style={{ width: '150px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input
                                                        type="range" min="0" max="100"
                                                        value={(formData.loraSlots[index]?.strength || 0.0) * 100}
                                                        onChange={e => {
                                                            const newSlots = [...formData.loraSlots];
                                                            newSlots[index] = { ...newSlots[index], strength: parseInt(e.target.value) / 100 };
                                                            setFormData({ ...formData, loraSlots: newSlots });
                                                        }}
                                                        style={{ flex: 1, accentColor: '#38bdf8' }}
                                                    />
                                                    <span style={{ width: '40px', fontSize: '12px', color: '#888', textAlign: 'right' }}>
                                                        {formData.loraSlots[index]?.strength?.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>Mix up to 4 models. Adjust strength to blend features (e.g. 0.7 = 70% influence).</p>
                                </div>

                                {/* Body Type - Visual Cards */}
                                <div>
                                    <label style={labelStyle}>Body Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '12px' }}>
                                        {bodyTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, bodyType: type })}
                                                style={{
                                                    padding: '20px 12px',
                                                    background: formData.bodyType === type ? '#fff' : '#111',
                                                    color: formData.bodyType === type ? '#000' : '#888',
                                                    border: formData.bodyType === type ? '1px solid #fff' : '1px solid #333',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '24px', marginBottom: '8px', opacity: formData.bodyType === type ? 1 : 0.5 }}>
                                                    {type.includes('Curvy') ? '🎱' : type.includes('Slim') ? '🧣' : type.includes('Athletic') ? '💪' : '✨'}
                                                </div>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Traits Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Hair Color</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                            {hairColors.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setFormData({ ...formData, hairColor: c })}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: formData.hairColor === c ? '#333' : '#111',
                                                        color: '#fff',
                                                        border: formData.hairColor === c ? '1px solid #fff' : '1px solid #333',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{
                                                        display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px',
                                                        background: c === 'Blonde' ? '#eab308' : c === 'Red' ? '#ef4444' : c === 'Black' ? '#000' : c === 'Brunette' ? '#78350f' : c === 'Pink' ? '#f472b6' : '#fff'
                                                    }} />
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Eye Color</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                            {eyeColors.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setFormData({ ...formData, eyeColor: c })}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: formData.eyeColor === c ? '#333' : '#111',
                                                        color: '#fff',
                                                        border: formData.eyeColor === c ? '1px solid #fff' : '1px solid #333',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{
                                                        display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px',
                                                        background: c.toLowerCase()
                                                    }} />
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Age Slider */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <label style={labelStyle}>Age Range</label>
                                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{formData.age} years old</span>
                                    </div>
                                    <input
                                        type="range" min="18" max="45" value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                        style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#444' }}>
                                        <span>18</span>
                                        <span>25</span>
                                        <span>35</span>
                                        <span>45+</span>
                                    </div>
                                </div>

                                {/* Generated Prompt Preview */}
                                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>✨</span>
                                            <label style={{ ...labelStyle, marginBottom: 0, color: '#fff' }}>Appearance Prompt</label>
                                        </div>
                                        <button onClick={generateAppearancePrompt} style={{ fontSize: '11px', padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            ↻ Update Prompt
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6', fontFamily: 'monospace' }}>
                                        {formData.avatarPrompt || "Select your traits above and click 'Update Prompt' to see the magic..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '8px', letterSpacing: '-0.02em' }}>Identity & Backstory</h2>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>Give your persona a name and handle to bring her to life.</p>

                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Name</label>
                                    <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Eve" autoFocus />
                                </div>
                                <div>
                                    <label style={labelStyle}>Handle</label>
                                    <input style={inputStyle} value={formData.handle} onChange={e => setFormData({ ...formData, handle: e.target.value })} placeholder="@eve_ai" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bio / Backstory</label>
                                    <textarea style={inputStyle} rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Write a short backstory or personality description..." />
                                </div>

                                <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)', marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
                                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Fanvue Connect</h3>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>Profile ID</label>
                                            <input style={{ ...inputStyle, background: 'rgba(0,0,0,0.3)' }} value={formData.fanvueProfileId} onChange={e => setFormData({ ...formData, fanvueProfileId: e.target.value })} placeholder="Found in DevTools" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Secret Token</label>
                                            <input style={{ ...inputStyle, background: 'rgba(0,0,0,0.3)' }} type="password" value={formData.fanvueSecret} onChange={e => setFormData({ ...formData, fanvueSecret: e.target.value })} placeholder="Your automation token" />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#38bdf8', opacity: 0.6, marginTop: '12px' }}>Optional: Connect now or configure later in settings.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>Personality & Brain</h2>
                            {/* LLM & Tags Selection could go here */}
                            <p style={{ color: '#666' }}>Work in progress - Select LLM Model, tags, etc.</p>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>Voice</h2>
                            <p style={{ color: '#666' }}>Work in progress - Voice selection preview.</p>
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>Review & Create</h2>
                            <p style={{ color: '#666' }}>Summary of all choices.</p>
                            <button onClick={handleCreate} style={{ padding: '12px 32px', background: '#fff', color: '#000', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}>Create Character</button>
                        </div>
                    )}


                    {/* Navigation Buttons */}
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '24px' }}>
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            style={{ padding: '10px 24px', background: 'transparent', color: step === 1 ? '#333' : '#fff', border: '1px solid #333', borderRadius: '2px', cursor: step === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Back
                        </button>

                        {step < 5 && (
                            <button
                                onClick={handleNext}
                                style={{ padding: '10px 32px', background: '#fff', color: '#000', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Next Step →
                            </button>
                        )}
                    </div>

                </div>

                {/* Live Preview Sidebar */}
                <div style={{ flex: 1, paddingTop: '60px' }}>
                    <div style={{ position: 'sticky', top: '40px' }}>
                        <h3 style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Character Preview</h3>
                        <div style={{ background: '#000', border: '1px solid #222', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '300px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '40px' }}>👤</div>
                                <span style={{ fontSize: '12px', color: '#444' }}>Avatar Preview</span>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{formData.name || 'Character Name'}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>{formData.handle || '@handle'}</div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[formData.bodyType, formData.hairColor].map(tag => (
                                        <span key={tag} style={{ fontSize: '10px', padding: '4px 8px', background: '#111', color: '#888', borderRadius: '2px' }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px'
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    background: '#000',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '2px',
    outline: 'none',
    fontSize: '14px'
};
