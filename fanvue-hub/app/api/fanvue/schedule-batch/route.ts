
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store jobs in a local JSON file for persistence
const DB_PATH = path.join(process.cwd(), 'scheduled_jobs.json');

export async function POST(request: Request) {
    try {
        const { items, days } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 });
        }

        const durationDays = days || 7;
        const postsPerDay = Math.ceil(items.length / durationDays);

        let existingJobs = [];
        try {
            if (fs.existsSync(DB_PATH)) {
                existingJobs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            }
        } catch (e) { console.error('Error reading jobs DB', e); }

        const newJobs = [];
        const now = new Date();

        // Strategy: Spread posts starting from TOMORROW 9 AM (or today if early enough)
        // For simplicity: Start scheduling from "Next Hour" but respect "sleeping hours" (00:00 - 09:00)?
        // Actually, simpler: Evenly distribute over X days between 9AM and 11PM.

        let scheduledTime = new Date(now);
        // Advance to next slot
        scheduledTime.setMinutes(scheduledTime.getMinutes() + 30);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Randomize times slightly
            const hour = Math.floor(Math.random() * (23 - 9 + 1) + 9); // 9 AM to 11 PM
            const minute = Math.floor(Math.random() * 60);

            // Calculate Day Offset
            const dayOffset = Math.floor(i / postsPerDay);

            const postDate = new Date();
            postDate.setDate(postDate.getDate() + dayOffset);
            postDate.setHours(hour, minute, 0, 0);

            // If past, push to tomorrow
            if (postDate < new Date()) {
                postDate.setDate(postDate.getDate() + 1);
            }

            newJobs.push({
                id: `job_${Date.now()}_${i}`,
                contentId: item.id,
                imageUrl: item.imageUrl,
                caption: item.caption,
                mood: item.mood,
                scheduledFor: postDate.toISOString(),
                status: 'pending',
                price: item.mood === 'ppv' ? 15 : 0, // Auto-price PPV logic
                isSubscriberOnly: true
            });
        }

        // Save
        const updatedJobs = [...existingJobs, ...newJobs];
        fs.writeFileSync(DB_PATH, JSON.stringify(updatedJobs, null, 2));

        return NextResponse.json({ success: true, count: newJobs.length, jobs: newJobs });

    } catch (error: any) {
        console.error('Scheduling error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) return NextResponse.json({ jobs: [] });
        const jobs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        return NextResponse.json({ success: true, jobs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const jobId = url.searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ success: false, error: 'jobId required' }, { status: 400 });
        }

        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json({ success: false, error: 'No jobs found' }, { status: 404 });
        }

        const jobs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const filteredJobs = jobs.filter((j: any) => j.id !== jobId);

        if (filteredJobs.length === jobs.length) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(filteredJobs, null, 2));
        return NextResponse.json({ success: true, message: 'Job cancelled' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
