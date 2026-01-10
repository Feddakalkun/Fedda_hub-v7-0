
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { FanvueClient } from '@/lib/fanvue-client';

const DB_PATH = path.join(process.cwd(), 'scheduled_jobs.json');

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json({ success: true, processed: 0, message: 'No jobs DB' });
        }

        const jobs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const now = new Date();
        const pendingJobs = jobs.filter((j: any) => j.status === 'pending' && new Date(j.scheduledFor) <= now);

        if (pendingJobs.length === 0) {
            return NextResponse.json({ success: true, processed: 0, message: 'No due jobs' });
        }

        // Initialize Client
        // Priority 1: Check Cookies (Browser Context)
        const cookieStore = await cookies();
        let token = cookieStore.get('fanvue_access_token')?.value;

        // Priority 2: Check Env (Headless Context)
        if (!token) {
            token = process.env.FANVUE_TOKEN || '';
        }

        if (!token) {
            console.warn('[CRON] Warning: No Auth Token found (Checked Cookies & ENV). Posting will be simulated.');
        }

        const client = new FanvueClient(token);
        // Logic: Try to post if we have credentials
        console.log(`[CRON] Found ${pendingJobs.length} jobs due.`);

        let processedCount = 0;

        for (const job of pendingJobs) {
            console.log(`[CRON] Processing job ${job.id}...`);

            try {
                // SIMULATION MODE (No Token)
                if (!token || token === 'MISSING_TOKEN') {
                    console.log(`[CRON] ⚠️ SIMULATION: Posting ${job.caption}`);
                    job.status = 'completed';
                    job.postedAt = new Date().toISOString();
                    processedCount++;
                    continue;
                }

                // REAL POSTING MODE (Token Exists)
                // 1. Fetch Image from Local Proxy
                // Assumes localhost:3000 if relative path. 
                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                const validUrl = job.imageUrl.startsWith('http') ? job.imageUrl : `${baseUrl}${job.imageUrl}`;

                const imgRes = await fetch(validUrl);
                if (!imgRes.ok) throw new Error(`Failed to fetch image from ${validUrl}: ${imgRes.statusText}`);
                const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

                // 2. Upload to Fanvue
                const filename = `empire_${Date.now()}.png`;
                const media = await client.uploadMedia(imgBuffer, filename);
                const mediaId = media.id || media.mediaId; // Handle API variance

                if (!mediaId) throw new Error('Upload successful but no Media ID returned');

                // 3. Create Post
                await client.createPost({
                    content: job.caption,
                    mediaIds: [mediaId],
                    isSubscriberOnly: true, // Always premium for Empire
                    price: job.price || 0
                });

                console.log(`[CRON] ✅ PUBLISHED: ${job.caption}`);
                job.status = 'completed';
                job.postedAt = new Date().toISOString();
                processedCount++;

            } catch (err: any) {
                console.error(`[CRON] ❌ FAILED job ${job.id}:`, err.message);
                job.status = 'failed';
                job.error = err.message;
            }
        }

        // Save back
        fs.writeFileSync(DB_PATH, JSON.stringify(jobs, null, 2));

        return NextResponse.json({ success: true, processed: processedCount, jobs: pendingJobs });

    } catch (error: any) {
        console.error('Cron error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
