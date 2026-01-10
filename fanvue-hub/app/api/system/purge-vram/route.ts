import { NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11435';
const COMFY_URL = 'http://localhost:8188';

export async function POST() {
    const report = { ollama: 'skipped', comfy: 'skipped' };

    // 1. Purge Ollama
    try {
        // List running models
        const psRes = await fetch(`${OLLAMA_URL}/api/ps`);
        if (psRes.ok) {
            const data = await psRes.json();
            const models = data.models || [];

            if (models.length > 0) {
                await Promise.all(models.map(async (m: any) => {
                    console.log(`[VRAM] Unloading Ollama model: ${m.name}`);
                    await fetch(`${OLLAMA_URL}/api/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: m.name,
                            keep_alive: 0 // Immediate unload
                        })
                    });
                }));
                report.ollama = `Unloaded ${models.length} models`;
            } else {
                report.ollama = 'No active models';
            }
        } else {
            report.ollama = 'Ollama API Error';
        }
    } catch (e) {
        console.error("Ollama Purge Failed", e);
        report.ollama = 'failed (service offline?)';
    }

    // 2. Purge ComfyUI
    // Try ComfyUI-Manager's /free endpoint
    try {
        const freeRes = await fetch(`${COMFY_URL}/free`, { method: 'POST' });
        if (freeRes.ok) {
            report.comfy = 'Triggered ComfyUI-Manager Free';
        } else {
            // Fallback: Access 'unload_models' via internal API if possible, but /free is best bet
            report.comfy = 'No /free endpoint found';
        }
    } catch (e) {
        report.comfy = 'ComfyUI offline';
    }

    return NextResponse.json({ success: true, report });
}
