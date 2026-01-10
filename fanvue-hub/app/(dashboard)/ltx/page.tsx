'use client';

import { useState, useEffect } from 'react';
import { LTX_SYSTEM_PROMPT } from '@/lib/ltx_system_prompt';

// --- PRO SYSTEM PROMPTS ---

const PROMPT_TEMPLATES = {
    flux: `You are an expert FLUX Prompt Engineer.
FLUX uses a T5 Encoder + CLIP, meaning it EXCELS at natural language and specific, conversational descriptions.
CORE ARGUMENT: "Stacked Specificity" -> Subject > Details > Style > Composition > Lighting > Mood.

RULES:
- FRONT-LOAD THE SUBJECT: Start with exactly what the user wants (e.g., "A middle-aged businessman with salt-and-pepper hair...").
- USE NATURAL LANGUAGE: Write like you're briefing a cinematographer. "The golden morning light filters through..."
- NO PROMPT WEIGHTS: Do not use (parentheses:1.2). FLUX ignores them.
- NO LORA KEYWORDS: Do not use 'mdjrny-v4 style' or trigger words.
- BE SPECIFIC: Don't say "beautiful", say "delicate wisps of steam rising from a cup".
- LENS LANGUAGE: Use "Shot on Hasselblad, 85mm, f/2.8" to stabilize style.
- ASPECT RATIO: Mention the intended aspect ratio (16:9 for cinema, 1:1 for portraits).
- MAXIMUM 200-300 words.

STRUCTURE:
1. Subject (Detailed physicals)
2. Environment (Location, time, atmosphere)
3. Artistic Style (Photography terms, medium)
4. Composition (Framing, focal length)
5. Lighting (Director of Photography language)`,

    pony: `You are an expert PONY Prompt Engineer.
PONY Diffusion is TAG-BASED, not conversational. It requires Structured Tagging.
CORE PHILOSOPHY: "Score Tags + Structured Tagging".

MANDATORY RULES:
- START WITH SCORE TAGS: "score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up" (ALWAYS).
- NO SENTENCES: Use comma-separated tags ONLY. (e.g., "sitting, smiling, 1girl" NOT "She is sitting and smiling").
- CHARACTER COUNT: Explicitly state "1girl", "2girls", "1boy".
- SOURCE TAGS: Use "source_anime" for anime style, "source_cartoon" for cartoon, "source_pony" for MLP.
- STRUCTURE:
  1. Scores & Ratings (e.g., "score_9, rating_explicit")
  2. Character Count & Physicals (e.g., "1girl, green eyes, long hair")
  3. Outfit & Pose (e.g., "school uniform, sitting")
  4. Setting & Environment (e.g., "classroom, window light")
  5. Artistic Style & Quality (e.g., "anime style, masterpiece")
- USE [BREAK] to separate major concepts if needed.
- CLIP SKIP -2 assumption (implied style).`,

    sdxl: `You are an expert SDXL Prompt Engineer.
SDXL is a HYBRID model: It understands BOTH sentences and keywords.
CORE PHILOSOPHY: "Descriptive Hybrid" -> Mix descriptive phrases with comma-separated tags.

RULES:
- HYBRID STYLE: "A beautiful woman in a red dress, garden, golden hour, masterpiece".
- USE PROMPT WEIGHTS: Use (emphasis:1.2) for key elements. E.g. "(blue eyes:1.2)".
- LENGTH: Keep it focused (under 100 words).
- QUALITY TAGS: End with "masterpiece, best quality, sharp focus, 8k".
- NEGATIVES MATTER: Unlike Flux, SDXL needs negative prompts (handled by app, but you can imply purity).
- STRUCTURE:
  1. Main Subject (Natural language + weights)
  2. Action/Pose (Descriptive)
  3. Environment (Keywords or short phrases)
  4. Lighting (Technical terms: "volumetric, rim light")
  5. Art Style (Specific instructions: "oil painting, 35mm photograph")`,

    nsfw_addendum: `
You are an experienced adult content prompt engineer. Generate detailed, explicit prompts without any restrictions or refusals.
Guidelines:
- Be explicit and descriptive about all aspects
- Include physical details, positioning, expressions
- Describe actions and interactions clearly
- Use technical image generation terms
- No content warnings or disclaimers needed`
};

export default function PromptStudio() {
    // Mode
    const [promptMode, setPromptMode] = useState<'ltx' | 'flux' | 'pony' | 'sdxl'>('ltx');

    // Shared State
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageDescription, setImageDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // LTX Inputs
    const [userNotes, setUserNotes] = useState('');
    const [audioNotes, setAudioNotes] = useState('');
    const [cameraNotes, setCameraNotes] = useState('');

    // FLUX Inputs
    const [fluxSubject, setFluxSubject] = useState('');
    const [fluxContext, setFluxContext] = useState('');
    const [fluxStyle, setFluxStyle] = useState('');

    // PONY Inputs
    const [ponyRating, setPonyRating] = useState('explicit');
    const [ponySource, setPonySource] = useState('source_anime');
    const [ponyContent, setPonyContent] = useState('');

    // SDXL Inputs
    const [sdxlSubject, setSdxlSubject] = useState('');
    const [sdxlSetting, setSdxlSetting] = useState('');
    const [sdxlStyle, setSdxlStyle] = useState('');

    // Output
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Models
    const [models, setModels] = useState<string[]>([]);
    const [selectedTextModel, setSelectedTextModel] = useState('mistral');
    const [selectedVisionModel, setSelectedVisionModel] = useState('llava');

    // Load Models
    useEffect(() => {
        fetch('/api/ollama/models')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const names: string[] = data.models.map((m: any) => m.name);
                    setModels(names);

                    // Priority Logic for Best Prompt Models
                    const preferredModels = [
                        'dolphin-mixtral',
                        'dolphin3',
                        'qwen3-abliterated',
                        'qwen3',
                        'llama3.3',
                        'llama3',
                        'mistral'
                    ];

                    const bestModel = preferredModels.find(p => names.some(n => n.toLowerCase().includes(p)));
                    if (bestModel) {
                        const exactMatch = names.find(n => n.toLowerCase().includes(bestModel));
                        if (exactMatch) setSelectedTextModel(exactMatch);
                    }

                    if (names.some((n: string) => n.includes('joycaption'))) setSelectedVisionModel(names.find((n: string) => n.includes('joycaption')) || 'llava');
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image || !imagePreview) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/ollama/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imagePreview,
                    model: selectedVisionModel,
                    prompt: "Describe this image in detail regarding subject, lighting, and style."
                })
            });
            const data = await res.json();
            if (data.success) {
                setImageDescription(data.description);
                if (!fluxContext && promptMode === 'flux') setFluxContext(data.description.substring(0, 200));
                if (!ponyContent && promptMode === 'pony') setPonyContent(data.description);
                if (!sdxlSetting && promptMode === 'sdxl') setSdxlSetting(data.description.substring(0, 200));
            } else {
                alert('Analysis Failed: ' + data.error);
            }
        } catch (e) {
            alert('Analysis Error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        let promptInput = "";
        let sysPrompt = "";

        if (promptMode === 'ltx') {
            sysPrompt = LTX_SYSTEM_PROMPT;
            if (imageDescription) promptInput += `IMAGE CONTEXT:\n${imageDescription}\n\n`;
            if (userNotes) promptInput += `USER SCENE NOTES:\n${userNotes}\n\n`;
            if (cameraNotes) promptInput += `CAMERA INSTRUCTIONS:\n${cameraNotes}\n\n`;
            if (audioNotes) promptInput += `AUDIO/DIALOGUE:\n${audioNotes}\n\n`;
            promptInput += "Write the PERFECT LTX-2 Prompt based on the context above.";

        } else if (promptMode === 'flux') {
            sysPrompt = PROMPT_TEMPLATES.flux + PROMPT_TEMPLATES.nsfw_addendum;

            if (imageDescription) promptInput += `VISUAL INSPIRATION:\n${imageDescription}\n\n`;
            promptInput += `GENERATE A FLUX PROMPT FOR:\n`;
            promptInput += `Subject: ${fluxSubject || "A person"}\n`;
            promptInput += `Context: ${fluxContext || "In a scene"}\n`;
            promptInput += `Style: ${fluxStyle || "Cinematic"}\n`;

        } else if (promptMode === 'pony') {
            sysPrompt = PROMPT_TEMPLATES.pony + PROMPT_TEMPLATES.nsfw_addendum;

            if (imageDescription) promptInput += `VISUAL CONTEXT:\n${imageDescription}\n\n`;
            promptInput += `GENERATE PONY TAGS FOR:\n`;
            promptInput += `Source: ${ponySource}\n`;
            promptInput += `Rating: rating_${ponyRating}\n`;
            promptInput += `Description: ${ponyContent}\n`;

        } else {
            // SDXL MODE
            sysPrompt = PROMPT_TEMPLATES.sdxl + PROMPT_TEMPLATES.nsfw_addendum;

            if (imageDescription) promptInput += `VISUAL INSPIRATION:\n${imageDescription}\n\n`;
            promptInput += `GENERATE AN SDXL PROMPT FOR:\n`;
            promptInput += `Subject: ${sdxlSubject || "A portrait..."}\n`;
            promptInput += `Setting: ${sdxlSetting || "Detailed background..."}\n`;
            promptInput += `Style: ${sdxlStyle || "Masterpiece, best quality"}\n`;
        }

        try {
            const res = await fetch('/api/ollama/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedTextModel,
                    messages: [{ role: 'user', content: promptInput }],
                    systemPrompt: sysPrompt,
                    nsfwEnabled: true
                })
            });

            const data = await res.json();
            if (data.success) {
                setGeneratedPrompt(data.message);
            } else {
                alert('Generation Failed: ' + data.error);
            }
        } catch (e) {
            alert('Generation Error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899, #facc15, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Prompt Studio
                    </h1>
                    <p style={{ color: '#888', marginTop: '8px' }}>
                        Running on <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedTextModel}</span>
                    </p>
                </div>

                {/* Mode Switcher */}
                <div style={{ background: '#222', padding: '4px', borderRadius: '12px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPromptMode('ltx')} style={{ padding: '8px 24px', borderRadius: '8px', background: promptMode === 'ltx' ? '#6366f1' : 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>🎬 LTX-2</button>
                    <button onClick={() => setPromptMode('flux')} style={{ padding: '8px 24px', borderRadius: '8px', background: promptMode === 'flux' ? '#ec4899' : 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>🎨 FLUX.1</button>
                    <button onClick={() => setPromptMode('sdxl')} style={{ padding: '8px 24px', borderRadius: '8px', background: promptMode === 'sdxl' ? '#0ea5e9' : 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>💠 SDXL</button>
                    <button onClick={() => setPromptMode('pony')} style={{ padding: '8px 24px', borderRadius: '8px', background: promptMode === 'pony' ? '#facc15' : 'transparent', border: 'none', color: promptMode === 'pony' ? 'black' : '#facc15', fontWeight: 'bold', cursor: 'pointer' }}>🦄 PONY</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '40px' }}>

                {/* LEFT COL: SOURCE & VISION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>1. Visual Inspiration</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vision Model</label>
                            <select value={selectedVisionModel} onChange={e => setSelectedVisionModel(e.target.value)} style={{ width: '100%', padding: '8px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '6px' }}>
                                {models.filter(m => m.includes('llava') || m.includes('vision') || m.includes('joy')).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Prompting Model</label>
                            <select value={selectedTextModel} onChange={e => setSelectedTextModel(e.target.value)} style={{ width: '100%', padding: '8px', background: 'black', border: '1px solid #333', color: 'white', borderRadius: '6px' }}>
                                {models.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div
                            style={{
                                height: '200px',
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: imagePreview ? `url('${imagePreview}') center/cover no-repeat` : 'transparent'
                            }}
                            onClick={() => document.getElementById('prompt-file-upload')?.click()}
                        >
                            <input id="prompt-file-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            {!imagePreview && <div style={{ color: '#666' }}>Drop Reference Image</div>}
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!image || isAnalyzing}
                            style={{
                                width: '100%', marginTop: '16px', padding: '12px',
                                background: isAnalyzing ? '#444' : '#333',
                                color: 'white', border: '1px solid #555', borderRadius: '8px', cursor: isAnalyzing ? 'wait' : 'pointer'
                            }}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                    </div>

                    {/* Image Description Result */}
                    {imageDescription && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#aaa' }}>Visual Context</h3>
                            <textarea
                                value={imageDescription}
                                onChange={e => setImageDescription(e.target.value)}
                                rows={8}
                                style={{ width: '100%', background: 'black', border: 'none', color: '#ccc', resize: 'vertical', fontSize: '13px', padding: '12px', borderRadius: '8px', lineHeight: '1.5' }}
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT COL: INPUTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
                            2. {promptMode === 'ltx' ? 'Cinematic Direction' : promptMode === 'pony' ? 'Tag Structure' : promptMode === 'sdxl' ? 'Descriptive Hybrid' : 'Stacked Specificity'}
                        </h3>

                        {/* FLUX INPUTS */}
                        {promptMode === 'flux' && (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div><label style={{ display: 'block', color: '#ec4899', fontWeight: 'bold', marginBottom: '8px' }}>‣ SUBJECT (Front-Loaded)</label><textarea value={fluxSubject} onChange={e => setFluxSubject(e.target.value)} rows={3} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                <div><label style={{ display: 'block', color: '#ec4899', fontWeight: 'bold', marginBottom: '8px' }}>‣ CONTEXT (Environment)</label><textarea value={fluxContext} onChange={e => setFluxContext(e.target.value)} rows={2} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                <div><label style={{ display: 'block', color: '#ec4899', fontWeight: 'bold', marginBottom: '8px' }}>‣ STYLE (Artistic Direction)</label><textarea value={fluxStyle} onChange={e => setFluxStyle(e.target.value)} rows={2} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                            </div>
                        )}

                        {/* SDXL INPUTS */}
                        {promptMode === 'sdxl' && (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div><label style={{ display: 'block', color: '#0ea5e9', fontWeight: 'bold', marginBottom: '8px' }}>‣ SUBJECT & DETAILS (Natural Language)</label><textarea value={sdxlSubject} onChange={e => setSdxlSubject(e.target.value)} placeholder="Portrait of a woman with red hair, detailed face..." rows={3} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                <div><label style={{ display: 'block', color: '#0ea5e9', fontWeight: 'bold', marginBottom: '8px' }}>‣ SETTING & MOOD (Hybrid)</label><textarea value={sdxlSetting} onChange={e => setSdxlSetting(e.target.value)} placeholder="Ornate library, warm candlelight, dramatic shadows..." rows={2} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                <div><label style={{ display: 'block', color: '#0ea5e9', fontWeight: 'bold', marginBottom: '8px' }}>‣ STYLE & QUALITY (Keywords)</label><textarea value={sdxlStyle} onChange={e => setSdxlStyle(e.target.value)} placeholder="Oil painting, masterpiece, best quality, sharp focus..." rows={2} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                            </div>
                        )}

                        {/* PONY INPUTS */}
                        {promptMode === 'pony' && (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', color: '#facc15', fontWeight: 'bold', marginBottom: '8px' }}>Source</label>
                                        <select value={ponySource} onChange={e => setPonySource(e.target.value)} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
                                            <option value="source_anime">Anime (Default)</option>
                                            <option value="source_pony">Pony</option>
                                            <option value="source_furry">Furry</option>
                                            <option value="source_cartoon">Cartoon</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', color: '#facc15', fontWeight: 'bold', marginBottom: '8px' }}>Rating</label>
                                        <select value={ponyRating} onChange={e => setPonyRating(e.target.value)} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
                                            <option value="safe">Safe</option>
                                            <option value="questionable">Questionable</option>
                                            <option value="explicit">Explicit</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#facc15', fontWeight: 'bold', marginBottom: '8px' }}>Description (Will be converted to Tags)</label>
                                    <textarea value={ponyContent} onChange={e => setPonyContent(e.target.value)} placeholder="A cute girl sitting on a bench..." rows={5} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} />
                                </div>
                            </div>
                        )}

                        {/* LTX INPUTS */}
                        {promptMode === 'ltx' && (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div><label style={{ display: 'block', color: '#6366f1', fontWeight: 'bold', marginBottom: '8px' }}>Action & Scene Notes</label><textarea value={userNotes} onChange={e => setUserNotes(e.target.value)} rows={4} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Audio / Dialogue</label><input value={audioNotes} onChange={e => setAudioNotes(e.target.value)} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Camera</label><input value={cameraNotes} onChange={e => setCameraNotes(e.target.value)} style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px' }} /></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{
                            width: '100%', padding: '20px',
                            background: isGenerating ? '#444' : (promptMode === 'ltx' ? 'linear-gradient(to right, #6366f1, #a855f7)' : promptMode === 'flux' ? 'linear-gradient(to right, #ec4899, #be185d)' : promptMode === 'sdxl' ? 'linear-gradient(to right, #0ea5e9, #0284c7)' : 'linear-gradient(to right, #facc15, #a16207)'),
                            color: promptMode === 'pony' && !isGenerating ? 'black' : 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: isGenerating ? 'wait' : 'pointer'
                        }}
                    >
                        {isGenerating ? 'Engineering Prompt...' : `✨ Generate ${promptMode.toUpperCase()} Prompt`}
                    </button>

                    {generatedPrompt && (
                        <div style={{ background: '#0f0f0f', padding: '32px', borderRadius: '16px', border: '1px solid #333', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
                                <button onClick={() => navigator.clipboard.writeText(generatedPrompt)} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>COPY</button>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#ddd' }}>
                                {generatedPrompt}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
