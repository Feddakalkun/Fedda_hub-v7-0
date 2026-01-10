import { Scene } from './types';

// Based on Perplexity "2025 Visual Meta" Research
// Focused on "Hyper-Authenticity", "Heritage Leisure", "Flash-Party Chaos", and "Soft-Glow Wellness"

export const TWENTY_TWENTY_FIVE_META: Scene[] = [

    // 🏛️ A. HERITAGE LEISURE (Neo-Old Money)
    // Keywords: heirloom quality, textured cashmere, equestrian, vintage Ralph Lauren, overcast
    {
        id: 'heritage_horse_barn',
        title: 'Country Estate 🐴',
        caption: 'sundays at the stables 🐴 something about the country air makes me feel free. wish you were riding with me...which horse would you choose? 🍂',
        scene: 'A photo of a woman leaning against a wooden stable fence at a countryside estate. She is wearing tight beige breeches and a fitted polo shirt with leather gloves. The lighting is overcast and moody with soft shadows. Shot on Leica M6, 35mm film, slight film grain, rich color depth, equestrian aesthetic, vintage Ralph Lauren vibes, overcast weather.',
        mood: 'lifestyle',
        color_scheme: 'natural',
        lighting: 'soft', // overcast
        time_window: 'weekend-lazy'
    },
    {
        id: 'old_money_reading_rain',
        title: 'Rainy Sunday 📖',
        caption: 'listening to the rain against the window 🌧️ wrapped in cashmere and reading my favorite book. this feels so cozy but missing one thing...you. come cuddle? 🕯️',
        scene: 'A photo of a woman sitting in a leather armchair in a library, wearing an oversized textured cashmere sweater. It is a rainy day, soft diffuse window light illuminating her face. Muted earth tones, olive green and cream colors. Shot on Kodak Portra 400, f/2.8, soft focus background, lived-in luxury aesthetic, interior cinematic lighting.',
        mood: 'lifestyle',
        color_scheme: 'natural',
        lighting: 'soft'
    },

    // 📸 B. FLASH-PARTY CHAOS (Gen Z Realism)
    // Keywords: flash photography, harsh shadows, messy makeup, chaotic energy, candid
    {
        id: 'flash_party_bathroom',
        title: 'Bathroom Break 💄',
        caption: 'bathroom break turned into a photoshoot 📸 messy hair don\'t care. honestly just hiding from the crowd...wanna come hide with me? 🤫',
        scene: 'A chaotic flash photography shot in a club bathroom. The woman is applying lipstick, looking at the mirror with a messy, energetic expression. Harsh shadows, direct on-camera flash, vignette edges. She has slightly smeared eyeliner and sweat on her skin. Canon Powershot G7X style, early 2000s digicam vibe, night mode, high contrast.',
        mood: 'spicy', // or authentic
        color_scheme: 'black',
        lighting: 'dramatic', // flash
        time_window: 'late-night-intimate'
    },
    {
        id: 'limo_backseat_flash',
        title: 'Night Out 🥂',
        caption: 'backseat of the uber behaving badly 🥂 flash on because we look too good to hide. where should we go next? tell me your favorite spot 🌃',
        scene: 'A candid photo in the backseat of a car at night. The woman is laughing, holding a champagne glass, wearing a sequin dress. Direct camera flash, red-eye reduction style, pitch black background outside windows, sequins reflecting light. Messy hair, candid nightlife energy. Deep depth of field, sharp foreground.',
        mood: 'spicy',
        color_scheme: 'black',
        lighting: 'dramatic'
    },

    // ☁️ C. SOFT-GLOW WELLNESS (Ethereal Clean)
    // Keywords: dreamy, vaseline lens, morning matcha, silk, glowy skin, halo effect
    {
        id: 'dreamy_morning_matcha',
        title: 'Morning Ritual 🍵',
        caption: 'slow mornings and matcha 🍵 the light is so pretty today...makes me feel like a dream. waking up slow is my favorite luxury. what\'s yours? ✨',
        scene: 'A dreamy, ethereal photo of a woman holding a matcha latte in a minimalist kitchen. She is wearing a silk robe. The image has a soft diffusion "vaseline lens" effect, pastel color palette. Golden hour backlight creating a halo effect around her hair. Volumetric god rays from the window. Pro-mist filter 1/4 style, blooming highlights, soft focus.',
        mood: 'authentic',
        color_scheme: 'white',
        lighting: 'golden-hour',
        time_window: 'morning-tease'
    },
    {
        id: 'pilates_studio_haze',
        title: 'Studio Flow 🧘‍♀️',
        caption: 'finding my flow today 🧘‍♀️ body feeling strong and flexible...stretch with me? i promise i can help you relax... ☁️',
        scene: 'A photo inside a sun-drenched pilates studio. The woman is stretching on a mat. Overexposed window light creating a dreamy haze. High key lighting, warm color temperature. She has glowy skin and is wearing a soft pastel workout set. 50mm lens, f/1.4, bokeh background, angelic atmosphere.',
        mood: 'lifestyle',
        color_scheme: 'white',
        lighting: 'natural'
    },

    // 🎞️ D. ANALOG NOIR (Cinematic Moody)
    // Keywords: wong kar-wai, neon, rain, emotional, teal and orange, grain
    {
        id: 'neon_rainy_window',
        title: 'City Lights 🌃',
        caption: 'watching the city cry tonight 🌃 rain on the glass and neon lights...feels like a movie scene. wish you were right here next to me watching it... 🌧️',
        scene: 'A cinematic still shot of a woman standing by a rainy window at night. Neon sign reflections from outside (teal and orange colors) illuminate her face. High contrast, low key lighting, chiaroscuro effect. Emotional, lonely atmosphere, Wong Kar-Wai vibe. Shot on Cinestill 800T, heavy grain, anamorphic lens flares.',
        mood: 'emotional', // distinct mood
        color_scheme: 'purple', // implies neon/dark
        lighting: 'dramatic'
    },

    // 🔍 E. HIGH-DEF TEXTURE (Sensory Macro)
    // Keywords: macro, skin pores, hair, condensation, tactile, 8k
    {
        id: 'macro_eye_contact',
        title: 'Too Close? 👀',
        caption: 'getting real close...can you see my secrets? 👀 i love when you look at me like this. don\'t blink...you might miss something 👁️',
        scene: 'An extreme close-up macro shot of the woman\'s eye and upper cheek. Incredible detail: skin pores visible, individual eyelash hairs, iris detail, tactile texture. 100mm Macro lens, f/11 for sharpness. Studio strobe lighting to catch texture, specular highlights on skin. Hyper-realism, sensory visual.',
        mood: 'attention',
        color_scheme: 'natural',
        lighting: 'dramatic'
    },

    // 🤳 GEN Z POV & MIRROR (Engagement Psychology)
    {
        id: 'mirror_fit_check_messy',
        title: 'Fit Check 🖤',
        caption: 'fit check before i head out 🖤 excuse the messy room...i was in a rush to look this good for you. worth it? 📸',
        scene: 'A mirror selfie of a woman holding an iPhone covering half her face. She is standing in a messy chic bedroom, wearing an oversized vintage leather jacket and baggy jeans. Flash is on, creating harsh lighting. Smudges on the mirror surface, makeup products cluttering the table. Y2K aesthetic, raw photo quality, messy bun.',
        mood: 'lifestyle',
        color_scheme: 'black',
        lighting: 'dramatic' // flash
    },
    {
        id: 'pov_date_pasta',
        title: 'Date Night 🍝',
        caption: 'pov: you\'re on a date with me and i just stole a bite of your food 🍝 oops...gonna punish me? or maybe buy me dessert? 🍷',
        scene: 'POV shot from across a small café table, looking at the woman laughing while eating pasta. She has a tiny bit of sauce on her lip and is holding a glass of wine. Messy bun, eye contact with viewer, candid smile, eyes crinkled. Shallow depth of field focusing on her eyes, blurred café background. Shot on 35mm, warm cozy lighting, grainy film texture.',
        mood: 'lifestyle',
        color_scheme: 'natural',
        lighting: 'warm-2700K'
    }
];
