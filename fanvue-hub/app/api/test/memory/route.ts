import { NextResponse } from 'next/server';
import { extractMemoriesFromMessage, saveMemories, loadCharacterMemories } from '@/lib/memory';

export async function GET() {
    const report: any = {};
    const TEST_CHAR = 'debug-char-1';
    const TEST_USER = 'user-local'; // Same as PhoneCall
    const TEST_MSG = "My name is Debugger and I like Pizza.";

    // 1. Extract
    try {
        console.log("Testing Extraction...");
        const extracted = await extractMemoriesFromMessage(TEST_MSG);
        report.extraction = { success: true, count: extracted.length, data: extracted };

        // 2. Save
        if (extracted.length > 0) {
            console.log("Testing Save...");
            await saveMemories(TEST_CHAR, TEST_USER, extracted, TEST_MSG);
            report.save = "Called saveMemories";
        }
    } catch (e: any) {
        report.extraction = { success: false, error: e.message };
    }

    // 3. Load
    try {
        console.log("Testing Load...");
        const loaded = await loadCharacterMemories(TEST_CHAR, TEST_USER);
        report.load = { success: true, count: loaded.length, data: loaded };
    } catch (e: any) {
        report.load = { success: false, error: e.message };
    }

    return NextResponse.json(report);
}
