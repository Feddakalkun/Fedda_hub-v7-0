import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { promptId } = await request.json();

        // Fetch result from ComfyUI history
        const historyRes = await fetch(`http://localhost:8188/history/${promptId}`);
        const historyData = await historyRes.json();

        const history = historyData[promptId];
        if (!history || !history.outputs) {
            return NextResponse.json({ error: 'No outputs found' }, { status: 404 });
        }

        // Find the SaveImage node output
        let imageUrl: string | null = null;
        for (const nodeId in history.outputs) {
            const nodeOutput = history.outputs[nodeId];
            if (nodeOutput.images && nodeOutput.images.length > 0) {
                const img = nodeOutput.images[0];
                // Construct URL to the image
                imageUrl = `/api/comfyui/view?filename=${img.filename}&subfolder=${img.subfolder || ''}&type=${img.type || 'output'}`;
                break;
            }
        }

        if (!imageUrl) {
            return NextResponse.json({ error: 'No image in outputs' }, { status: 404 });
        }

        // Update character with new avatar
        const character = await prisma.character.update({
            where: { slug },
            data: { avatarUrl: imageUrl }
        });

        return NextResponse.json({
            success: true,
            avatarUrl: imageUrl,
            character
        });

    } catch (error: any) {
        console.error('Save avatar error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
