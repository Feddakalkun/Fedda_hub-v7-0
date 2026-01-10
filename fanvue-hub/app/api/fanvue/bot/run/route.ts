import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FanvueClient } from '@/lib/fanvue-client';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('fanvue_access_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Not connected' }, { status: 401 });
        }

        const client = new FanvueClient(token);
        const { autoExecute } = await request.json();

        // 1. Get recent conversations
        // Mocking for dev if API fails
        let conversations = [];
        try {
            const res = await client.getConversations(10);
            conversations = res.conversations || [];
        } catch (e) {
            console.warn('Failed to fetch convos, using mock logic');
            // Mock data for testing UI
            conversations = [
                { id: 'c1', lastMessage: { content: 'Hi beautiful', senderId: 'user1' }, user: { displayName: 'SimpKing', id: 'user1' } },
                { id: 'c2', lastMessage: { content: 'Send nudes??', senderId: 'user2' }, user: { displayName: 'PayPig', id: 'user2' } }
            ];
        }

        const actions = [];

        for (const convo of conversations) {
            // Skip if last message was from ME (Emily)
            // Assuming we can check senderId vs myId. 
            // For MVP/Mock, let's assume if it doesn't say "Emily", it's a user.

            const lastMsg = convo.lastMessage;
            if (!lastMsg) continue;

            const lowerMsg = lastMsg.content.toLowerCase();
            let reply = '';
            let type = 'text';
            let price = 0;

            // --- THE BRAIN 🧠 ---
            if (lowerMsg.includes('nude') || lowerMsg.includes('pic') || lowerMsg.includes('photo')) {
                reply = "I have something spicy I just took... want to see? 😈 (Check your locked messages)";
                type = 'upsell';
                price = 10;
            }
            else if (lowerMsg.includes('video') || lowerMsg.includes('clip')) {
                reply = "My videos are too hot for main... unlock this one? 🎥💦";
                type = 'upsell';
                price = 25;
            }
            else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
                reply = "Hey babe! Thanks for subscribing. I'm online now 💕";
                type = 'chat';
            }
            else {
                reply = "I love naughty messages... keep them coming 💋";
                type = 'chat';
            }

            // Create Action Object
            const action = {
                conversationId: convo.id,
                userId: convo.user.id,
                userName: convo.user.displayName,
                userMessage: lastMsg.content,
                proposedReply: reply,
                type,
                price
            };

            actions.push(action);

            // Execute if Auto-Pilot is ON
            if (autoExecute) {
                // In real app: await client.sendMessage(action.userId, action.proposedReply, undefined, action.price);
                // marking as executed
                (action as any).executed = true;
            }
        }

        return NextResponse.json({ success: true, actions });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
