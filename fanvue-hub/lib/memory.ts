import { prisma } from '@/lib/prisma';

const OLLAMA_URL = 'http://127.0.0.1:11435';
const EXTRACTION_MODEL = 'mistral';

export interface ExtractedMemory {
    type: 'name' | 'interest' | 'preference' | 'fact' | 'emotion';
    value: string;
    confidence: number;
}

export async function extractMemoriesFromMessage(
    message: string,
    characterContext: string = ''
): Promise<ExtractedMemory[]> {

    const systemPrompt = `You are a memory extraction system.
  Task: Analyze the USER's message and extract key facts about them. 
  Focus on: Names, Interests, Preferences (likes/dislikes), Personal Facts, and Emotional State.
  Return ONLY a JSON array of objects. No markdown, no text.
  
  Format: [{"type": "name|interest|preference|fact|emotion", "value": "extracted text", "confidence": 0-100}]

  Example:
  User: "My name is John and I love skiing"
  Result: [{"type": "name", "value": "John", "confidence": 100}, {"type": "interest", "value": "skiing", "confidence": 90}]
  
  Only return facts with >50 confidence. If nothing relevant, return [].`;

    console.log(`[Memory] Extracting from: "${message}"`);

    try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: EXTRACTION_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) throw new Error(`Ollama extraction failed: ${response.status}`);

        const data = await response.json();
        const content = data.message?.content || '[]';

        return parseExtractedJSON(content);

    } catch (e: any) {
        console.warn("[Memory] Ollama Extraction Failed, trying regex fallback...", e.message);

        // 🎯 SIMPLE REGEX FALLBACK (always works)
        const regexMemories: ExtractedMemory[] = [];

        // Extract name patterns
        const namePatterns = [
            /(?:my name is|i'm|i am|call me)\s+([a-z]+)/i,
            /name\s+is\s+([a-z]+)/i,
            /([A-Z][a-z]+)\s+here/,
        ];

        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                regexMemories.push({
                    type: 'name',
                    value: match[1],
                    confidence: 80
                });
                console.log(`[Memory] 📝 Regex extracted name: ${match[1]}`);
                break; // Only one name
            }
        }

        // If regex found something, use it
        if (regexMemories.length > 0) {
            return regexMemories;
        }

        // Otherwise try Gemini
        console.warn("[Memory] No regex matches, trying Gemini...");
        return await extractWithGemini(message, systemPrompt);
    }
}

async function extractWithGemini(message: string, systemPrompt: string): Promise<ExtractedMemory[]> {
    try {
        const config = await prisma.appConfig.findUnique({ where: { id: 'global' } });
        const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("[Memory] No Gemini API Key for fallback");
            return [];
        }

        const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseMimeType: "application/json" },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = `${systemPrompt}\n\nUser Message to Extract: "${message}"`;
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        return parseExtractedJSON(content);

    } catch (e) {
        console.error("[Memory] Gemini Extraction Failed:", e);
        return [];
    }
}

function parseExtractedJSON(content: string): ExtractedMemory[] {
    let extracted: ExtractedMemory[] = [];
    try {
        extracted = JSON.parse(content);
    } catch (e) {
        console.warn("[Memory] JSON Parse failed, trying regex cleanup");
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
            try { extracted = JSON.parse(match[0]); } catch { }
        }
    }
    return Array.isArray(extracted) ? extracted.filter(m => m.confidence > 50) : [];
}

export async function saveMemories(
    characterId: string,
    userId: string,
    memories: ExtractedMemory[],
    originalMessage: string
) {
    if (!characterId || !userId || memories.length === 0) return;

    if (!prisma.characterMemory) return; // Should not happen after generate

    console.log(`[Memory] Saving ${memories.length} memories for Char ${characterId} / User ${userId}`);

    for (const memory of memories) {
        try {
            // Conflict Resolution: If type is 'name', ensure unique (User only has one name)
            if (memory.type === 'name') {
                await prisma.characterMemory.deleteMany({
                    where: {
                        characterId,
                        userId,
                        memoryType: 'name',
                        memoryContent: { not: memory.value }
                    }
                });
            }

            const existing = await prisma.characterMemory.findFirst({
                where: {
                    characterId,
                    userId,
                    memoryType: memory.type,
                    memoryContent: memory.value
                }
            });

            if (existing) {
                await prisma.characterMemory.update({
                    where: { id: existing.id },
                    data: {
                        mentionedCount: { increment: 1 },
                        lastMentionedAt: new Date(),
                        memoryStrength: { increment: 5 }
                    }
                });
            } else {
                await prisma.characterMemory.create({
                    data: {
                        characterId,
                        userId,
                        memoryType: memory.type,
                        memoryContent: memory.value,
                        memoryStrength: memory.confidence,
                        originalMessage,
                        lastMentionedAt: new Date()
                    }
                });
            }
        } catch (e) {
            console.error(`[Memory] Failed to save memory: ${memory.value}`, e);
        }
    }
}

export async function loadCharacterMemories(characterId: string, userId: string): Promise<ExtractedMemory[]> {
    if (!characterId || !userId) return [];
    if (!prisma.characterMemory) return [];

    try {
        const memories = await prisma.characterMemory.findMany({
            where: {
                characterId,
                userId,
                memoryStrength: { gte: 10 }
            },
            orderBy: [
                { lastMentionedAt: 'desc' },
                { memoryStrength: 'desc' }
            ],
            take: 20
        });

        return memories.map((m: any) => ({
            type: m.memoryType,
            value: m.memoryContent,
            confidence: m.memoryStrength
        }));
    } catch (e) {
        console.error("[Memory] Load Error:", e);
        return [];
    }
}

export function formatMemoriesForPrompt(memories: ExtractedMemory[]): string {
    if (memories.length === 0) return '';
    const unique = Array.from(new Set(memories.map(m => `${m.type}: ${m.value}`)));
    return `\n\n[INTERNAL MEMORY - DO NOT SPEAK THIS OUT LOUD]\nWhat you know about this user:\n${unique.join('\n')}\n[USE THIS INFO NATURALLY IN CONVERSATION - DON'T RECITE IT]`;
}

export async function applyMemoryDecay(characterId: string, userId: string) {
    if (!characterId || !userId) return;
    if (!prisma.characterMemory) return;

    try {
        const memories = await prisma.characterMemory.findMany({
            where: { characterId, userId }
        });

        const now = new Date();
        const ONE_DAY = 1000 * 60 * 60 * 24;

        for (const memory of memories) {
            const lastMention = new Date(memory.lastMentionedAt || memory.createdAt);
            const daysSince = Math.floor((now.getTime() - lastMention.getTime()) / ONE_DAY);

            if (daysSince < 1) continue;

            let decayFactor = 1;
            if (daysSince < 7) {
                decayFactor = 1 - (daysSince * 0.02);
            } else {
                decayFactor = 0.8;
            }

            const lastUpdate = new Date(memory.updatedAt);
            if ((now.getTime() - lastUpdate.getTime()) < ONE_DAY) {
                continue;
            }

            const newStrength = Math.floor(memory.memoryStrength * decayFactor);

            if (newStrength !== memory.memoryStrength) {
                await prisma.characterMemory.update({
                    where: { id: memory.id },
                    data: { memoryStrength: newStrength }
                });
            }
        }
    } catch (e) {
        console.error("[Memory] Decay Error:", e);
    }
}
