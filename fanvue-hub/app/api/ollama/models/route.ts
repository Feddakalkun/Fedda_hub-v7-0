import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11435';

export async function GET(req: NextRequest) {
    try {
        // Fetch installed models
        const res = await fetch(`${OLLAMA_URL}/api/tags`);

        if (!res.ok) {
            // If connection fails, assume Ollama not running
            throw new Error('Ollama service unreachable');
        }

        const data = await res.json();
        return NextResponse.json({
            success: true,
            models: data.models || []
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            models: [] // Return empty if failed
        }, { status: 503 }); // Service Unavailable
    }
}

export async function POST(req: NextRequest) {
    try {
        const { model } = await req.json();

        if (!model) {
            return NextResponse.json({ error: 'Model name required' }, { status: 400 });
        }

        console.log(`[Ollama] Pulling model: ${model}`);

        // Trigger pull (streaming is hard in serverless function proxy, 
        // we might just trigger it and return "started", letting frontend poll or wait)
        // Ollama /api/pull is a streaming endpoint usually.
        // For simplicity, we'll await the whole thing or detach? 
        // Next.js functions have timeouts (default 10s-60s locall).
        // Pulling takes minutes.
        // We should trigger it and let it run, returning immediately?
        // But Next.js might kill the fetch if we return.

        // BETTER APPROACH: Use the client (browser) to hit Ollama directly? 
        // No, invalid CORS usually.

        // We will start the fetch and NOT await the body fully, or use a "stream: false" flag if available?
        // Ollama API /pull with "stream": false waits until complete. That will timeout.
        // We must stream.

        // For this MVP, let's try to pass the stream back to the client?
        // Or just let the user run "ollama pull" in terminal if this is too complex?
        // No, user specifically asked for UI.

        // Let's forward the request to Ollama and stream the response to the client.
        const upstreamRes = await fetch(`${OLLAMA_URL}/api/pull`, {
            method: 'POST',
            body: JSON.stringify({ name: model }), // stream: true is default
        });

        if (!upstreamRes.ok) {
            throw new Error(`Failed to start pull: ${upstreamRes.statusText}`);
        }

        // Return the stream directly
        return new NextResponse(upstreamRes.body, {
            headers: {
                'Content-Type': 'application/x-ndjson', // Ollama sends JSON objects stream
                'Transfer-Encoding': 'chunked'
            }
        });

    } catch (error: any) {
        console.error('[Ollama Pull] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
