import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default settings  
    const settings = await prisma.settings.upsert({
        where: { id: 'cldefault123' },
        update: {},
        create: {
            id: 'cldefault123',
            autoPublishEnabled: false,
            autoMessageEnabled: false,
        },
    });

    console.log('✅ Settings created');

    // Create Emily character
    const emily = await prisma.character.upsert({
        where: { name: 'Emily' },
        update: {},
        create: {
            name: 'Emily',
            description: 'Your primary Fanvue character - athletic, friendly, and authentic',
            personality: `# EMILY - CHARACTER PERSONALITY

Athletic fitness model with girl-next-door charm. Ultra-fit physique with visible muscle definition. Characteristics:
- Icy blue piercing eyes
- Ash blonde hair (darker roots, platinum tips)
- Natural freckles across nose and cheeks
- Fair, porcelain complexion
- Athletic, toned body with washboard abs
- Petite, perky chest
- Friendly, approachable personality
- Authentic and genuine communication style`,
            referenceImages: JSON.stringify([
                '/images/0_00003_.png',
                '/images/0_00006_.png',
                '/images/0_00012_.png',
                '/images/0_00015_.png',
            ]),
            voiceId: 'odyUrTN5HMVKujvVAgWW',
            voiceIdWhisper: '1cxc5c3E9K6F1wlqOJGV',
            voiceSettings: JSON.stringify({
                stability: 0.55,
                similarity_boost: 0.75,
                style: 0.35,
            }),
            defaultPromptPrefix: 'Professional portrait photography, young woman with ash blonde hair, natural freckles, icy blue eyes, athletic physique',
            defaultNegativePrompt: 'cartoon, anime, illustration, fake, artificial',
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

    console.log('✅ Emily character created');

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
