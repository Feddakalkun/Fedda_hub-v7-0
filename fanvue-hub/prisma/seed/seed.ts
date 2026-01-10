import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default settings
    const settings = await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            autoPublishEnabled: false,
            autoMessageEnabled: false,
        },
    });

    console.log('✅ Settings created:', settings.id);

    // Load Emily's character reference
    const emilyCharacterPath = path.join(process.cwd(), '..', 'Emily', 'CHARACTER', 'EMILY_CHARACTER_REFERENCE.md');
    let emilyDescription = 'Ultra-athletic model with icy blue eyes, ash blonde hair, natural freckles, and a girl-next-door aesthetic.';

    if (fs.existsSync(emilyCharacterPath)) {
        emilyDescription = fs.readFileSync(emilyCharacterPath, 'utf-8');
    }

    // Create Emily character
    const emily = await prisma.character.upsert({
        where: { name: 'Emily' },
        update: {},
        create: {
            name: 'Emily',
            description: 'Your primary Fanvue character - athletic, friendly, and authentic',
            personality: emilyDescription,
            referenceImages: JSON.stringify([
                '/images/0_00003_.png',
                '/images/0_00006_.png',
                '/images/0_00012_.png',
                '/images/0_00015_.png',
            ]),
            voiceId: 'odyUrTN5HMVKujvVAgWW', // Emily's normal voice
            voiceIdWhisper: '1cxc5c3E9K6F1wlqOJGV', // Emily's whisper voice
            voiceSettings: JSON.stringify({
                stability: 0.55,
                similarity_boost: 0.75,
                style: 0.35,
            }),
            defaultPromptPrefix: 'Professional portrait photography, young woman with ash blonde hair, natural freckles, icy blue eyes, athletic physique',
            defaultNegativePrompt: 'cartoon, anime, illustration, fake, artificial, oversaturated, bad anatomy',
            generationSettings: JSON.stringify({
                fal: {
                    model: 'fal-ai/nano-banana-pro/edit',
                    resolution: '2K',
                    aspectRatio: '4:3',
                },
            }),
            isActive: true,
            isPrimary: true,
        },
    });

    console.log('✅ Emily character created:', emily.id);

    // Create welcome message template
    const welcomeMessage = await prisma.message.upsert({
        where: { id: 'welcome-template' },
        update: {},
        create: {
            id: 'welcome-template',
            characterId: emily.id,
            isTemplate: true,
            name: 'Welcome Message',
            content: 'Hey {{name}}! 💕 Thank you so much for subscribing! I\'m so excited to have you here. Feel free to message me anytime - I love chatting with my supporters! ✨',
            trigger: 'new_subscriber',
            isActive: true,
        },
    });

    console.log('✅ Welcome message template created');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
