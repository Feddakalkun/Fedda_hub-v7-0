import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11435';

export async function POST(req: NextRequest) {
    try {
        const { image, prompt, model } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Image required' }, { status: 400 });
        }

        // image should be base64 string
        // Ollama expects pure base64 string in 'images' array
        const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'llava',
                prompt: prompt || 'Describe this image in extreme detail, focusing on lighting, camera angle, and action.',
                images: [base64Image],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama Error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, description: data.response });

    } catch (e: any) {
        console.error("Vision Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
