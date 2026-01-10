// Shared scene library for all personas
// Each scene is character-agnostic and gets personalized with character tags
// ✅ ALL CAPTIONS OPTIMIZED WITH HBA FORMULA (Hook-Body-Action) for 23% more engagement
// ✅ RESEARCH-BACKED POSES from Top 10 Most Profitable list
// ✅ COLOR PSYCHOLOGY OPTIMIZATION for maximum engagement
// ✅ SCHEDULING OPTIMIZATION based on 40+ male engagement patterns

import { Scene } from './types';
import { VIRAL_SCENES } from './viral-scenes';
import { TWENTY_TWENTY_FIVE_META } from './meta-2025-scenes';

// Scene interface moved to types.ts

const CORE_SCENES: Scene[] = [
    // 🖼️ PROFILE & BANNERS
    {
        id: 'reddit_banner',
        title: 'Reddit Banner (4:1)',
        caption: 'New banner incoming 🎨 making my profile extra special for you 💕',
        scene: 'wide cinematic shot, cozy aesthetic bedroom, messy bed with white sheets, soft morning light, woman lying on bed reading book, relaxed vibe, blurred background, high quality, 4k, home aesthetic, intimate atmosphere',
        mood: 'banner',
        color_scheme: 'white',
        lighting: 'natural',
        optimal_time: '9-11 AM',
        best_days: ['Any'],
        time_window: 'morning-tease'
    },

    // 📸 MORNING VIBES
    {
        id: 'morning_wakeup',
        title: 'Good Morning 🌅',
        caption: 'just woke up thinking about you 😴 wish you were here to keep me warm in bed...stay with me a little longer? 🥺💕',
        scene: 'bedroom mirror selfie, wearing loose grey tank top, messy unbrushed hair, no makeup with sleepy eyes, natural window light, playful smile, camera angle from chest level showing upper body, amateur phone selfie quality',
        mood: 'authentic',
        color_scheme: 'white',
        lighting: 'natural',
        optimal_time: '7-9 AM',
        best_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time_window: 'morning-tease'
    },
    {
        id: 'morning_coffee',
        title: 'Morning Coffee ☕',
        caption: 'coffee first...then maybe something else? 😏 been craving you all morning babe...tell me what you\'re thinking about 💭',
        scene: 'kitchen counter selfie from low angle, wearing loose oversized white t-shirt slipping off one shoulder showing bare shoulder, holding coffee mug with both hands, messy morning hair, natural morning light through window, slight smirk, camera at chest level, intimate morning vibe',
        mood: 'authentic',
        color_scheme: 'white',
        lighting: 'natural'
    },

    // 😊 CASUAL & PLAYFUL
    {
        id: 'midday_bored',
        title: 'Bored 👅',
        caption: 'sooo bored and feeling naughty 👅 need someone to entertain me right now...what would you do to me if you were here? 😈',
        scene: 'bedroom mirror selfie from low angle, wearing loose oversized hoodie pulled off one shoulder, messy hair, soft afternoon light from window, unmade bed visible behind, sticking tongue out playfully at camera, teasing playful vibe, one hand in hair, camera positioned at chest level, amateur phone quality',
        mood: 'teasing',
        color_scheme: 'natural',
        lighting: 'soft',
        optimal_time: '12-5 PM',
        best_days: ['Any'],
        time_window: 'afternoon-casual'
    },
    {
        id: 'workout_done',
        title: 'Workout Done 💪',
        caption: 'post-workout glow 💦 feeling extra slutty after that sweat session...wanna help me stretch? tell me yes 🫦',
        scene: 'bathroom mirror selfie after workout, wearing tight sports bra and shorts, post-workout glow with slight sweat, hair in messy high ponytail, showing off toned stomach and shoulders, playful expression touching lip with finger, natural lighting, camera angle showing full torso, fitness vibe but teasing',
        mood: 'teasing',
        color_scheme: 'black',
        lighting: 'natural'
    },

    // 🌙 EVENING & NIGHT
    {
        id: 'evening_cozy',
        title: 'Goodnight 😏',
        caption: 'bed time but I can\'t stop thinking about you 🥺 wish you were here to tuck me in...would you stay the night with me? 💕',
        scene: 'cozy evening bedroom selfie from lower angle, wearing loose hoodie unzipped showing tank top underneath, sitting against headboard with pillows, warm bedside lamp creating orange glow, dark window in background, biting lower lip with flirty expression, playful seductive eyes, slight smirk, one hand touching face, camera positioned at chest level, intimate cozy vibe, amateur phone selfie quality',
        mood: 'spicy',
        color_scheme: 'natural',
        lighting: 'warm-2700K'
    },
    {
        id: 'cant_sleep',
        title: "Can't Sleep 🥺",
        caption: "can\'t sleep and I\'m feeling lonely 🥺 keep thinking about what we could be doing right now...will you keep me company tonight baby? 💭",
        scene: 'dim bedroom selfie lying flat on back in bed, wearing thin white tank top, messy hair spread on pillow, warm lamp glow creating intimate mood, looking up at camera with soft sleepy eyes, slight lip bite, camera angle from directly above looking down, arm stretched up holding phone, cozy intimate inviting vibe',
        mood: 'spicy',
        color_scheme: 'white',
        lighting: 'warm-2700K',
        optimal_time: '9 PM-12 AM',
        best_days: ['Any'],
        time_window: 'late-night-intimate'
    },

    // 💋 FLIRTY & TEASING
    {
        id: 'mirror_tease',
        title: 'Feeling Cute 💕',
        caption: 'feeling cute and a little bold today 🫣 might send you something special later...should I or should I wait? you tell me 👀',
        scene: 'full-length bedroom mirror selfie, wearing casual outfit, confident pose, one hand on hip, soft natural lighting, messy room in background, playful smile, camera held at waist level, candid amateur vibe',
        mood: 'teasing',
        color_scheme: 'pink',
        lighting: 'soft',
        optimal_time: '12-5 PM',
        best_days: ['Any'],
        time_window: 'afternoon-casual'
    },
    {
        id: 'shower_steam',
        title: 'After Shower 🚿',
        caption: 'fresh out the shower and feeling so clean 💦 but I\'m already thinking dirty thoughts about you...wanna make me dirty again? 😈',
        scene: 'bathroom mirror selfie, wearing towel wrapped around body, wet hair, steam on mirror edges, dewy skin, natural post-shower glow, soft bathroom lighting, casual relaxed expression, amateur phone quality',
        mood: 'spicy',
        color_scheme: 'white',
        lighting: 'soft',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },

    // 🔥 SPICY (More Suggestive)
    {
        id: 'bedroom_eyes',
        title: 'Come Here 😈',
        caption: 'thinking about you does things to me 😈 I need you so bad right now baby...come here and show me what you got 🔥',
        scene: 'close-up bedroom selfie from above, lying in bed, wearing minimal clothing, sultry expression, bedroom eyes looking directly at camera, soft dramatic lighting from side, intimate atmosphere, suggestive but tasteful',
        mood: 'spicy',
        color_scheme: 'red',
        lighting: 'dramatic',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'getting_ready',
        title: 'Getting Ready 💄',
        caption: 'getting all dolled up for tonight 💋 putting on something special just for you babe...wanna see what I picked out? 👗',
        scene: 'bathroom vanity mirror selfie, doing makeup, wearing robe or towel, natural lighting, makeup products visible on counter, focused expression, camera angle from chest up, intimate getting-ready moment',
        mood: 'authentic',
        color_scheme: 'pink',
        lighting: 'natural'
    },

    // 🎀 GIRLFRIEND EXPERIENCE
    {
        id: 'lazy_sunday',
        title: 'Lazy Sunday 🛏️',
        caption: 'lazy sunday vibes and I\'m all alone 💕 zero plans except thinking about you...wanna come cuddle with me? I promise I\'ll make it worth your while 😏',
        scene: 'bedroom selfie sprawled on bed, wearing comfy oversized t-shirt, messy hair, natural light through window, relaxed comfortable expression, one leg bent, pillows around, cozy intimate vibe, girlfriend energy',
        mood: 'authentic',
        color_scheme: 'natural',
        lighting: 'natural'
    },
    {
        id: 'netflix_chill',
        title: 'Netflix Anyone? 📺',
        caption: 'netflix and chill tonight? 👀 but let\'s be honest we both know we won\'t be watching much...what are you waiting for? come over 🫦',
        scene: 'couch selfie, wearing comfy loungewear, blanket visible, TV glow in background, cozy evening lighting, playful inviting smile, casual relaxed pose, intimate home vibe',
        mood: 'teasing',
        color_scheme: 'natural',
        lighting: 'warm-2700K'
    },

    // 🍑 ATTENTION / PREMIUM (Optimized with HBA + Research-backed psychology)
    {
        id: 'arched_bed_morning',
        title: 'Morning Stretch 🌅',
        caption: 'woke up so horny this morning 😴 been stretching in bed thinking about you...wish these were your hands on me right now 🥵',
        scene: 'lying on stomach in bed, back naturally arched, looking over shoulder at camera, wearing oversized t-shirt or tank top, messy morning hair, soft golden hour window light, intimate bedroom setting, casual authentic vibe, slight smile, amateur phone quality held at arm\'s length',
        mood: 'attention',
        color_scheme: 'white',
        lighting: 'golden-hour',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'lingerie_mirror_back',
        title: 'What Do You Think? 💕',
        caption: 'just got this new set and I\'m obsessed 🫣 do you like it when I dress up for you like this? be honest...I can take it 😈',
        scene: 'full-length bedroom mirror selfie from behind, looking back over shoulder at camera, wearing matching lace lingerie set, natural window lighting creating soft glow, one hand on hip, confident but approachable pose, clean bedroom background, phone held behind back, emphasis on elegant feminine curves',
        mood: 'attention',
        color_scheme: 'red',
        lighting: 'natural',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'kneeling_bed_tease',
        title: 'Making the Bed 🛏️',
        caption: 'supposed to be productive today 😏 but all I can think about is getting back in bed with you...should I just give up and wait for you? 🛏️',
        scene: 'kneeling on bed from side angle, reaching forward to arrange pillows, back slightly arched, wearing short sleep shorts and tank top or sports bra, natural bedroom light from window, messy sheets visible, casual intimate moment, hair falling forward, caught-in-the-moment aesthetic',
        mood: 'attention',
        color_scheme: 'pink',
        lighting: 'natural'
    },
    {
        id: 'window_light_lingerie',
        title: 'Golden Hour 🌞',
        caption: 'the lighting in here is making me feel some type of way 😮‍💨 I look so good I had to share it with you...do I look as good as I feel baby? 🌅',
        scene: 'standing by window with sheer curtains, soft golden hour backlighting creating silhouette effect, wearing delicate lace lingerie or sheer robe, looking towards window or slightly back at camera, dreamy romantic atmosphere, natural warm glow highlighting curves, intimate bedroom setting, elegant pose',
        mood: 'attention',
        color_scheme: 'white',
        lighting: 'golden-hour',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'towel_slip_bathroom',
        title: 'Post-Shower Moment 💦',
        caption: 'almost dropped my towel taking this pic 🙈 feeling fresh and clean but already thinking dirty thoughts about you...wanna help me get messy again? 💦',
        scene: 'bathroom mirror selfie standing, towel wrapped loosely around body with one hand holding it closed, water droplets on shoulders and collarbones, dewy fresh skin, wet hair, slightly steamed mirror in background, soft bathroom lighting, natural beauty vibe, playful expression looking back at camera through mirror',
        mood: 'attention',
        color_scheme: 'white',
        lighting: 'soft'
    },
    {
        id: 'legs_up_bed_reading',
        title: 'Just Relaxing 📖',
        caption: 'lazy afternoon alone and I\'m bored out of my mind 💭 what are you up to right now? I could use some company...and maybe something more 😏',
        scene: 'lying on back in bed, legs bent and elevated resting against wall or headboard, wearing comfortable shorts or just oversized shirt, holding phone or book, casual intimate bedroom vibe, soft natural lighting, messy comfortable setting, inviting relaxed energy, camera angle from above showing figure',
        mood: 'attention',
        color_scheme: 'natural',
        lighting: 'soft'
    },
    {
        id: 'sitting_bed_edge_bra',
        title: 'Getting Dressed... Slowly 👗',
        caption: 'getting ready SO slowly this morning 😌 keep getting distracted thinking about what you\'d do if you walked in right now...would you help me finish getting dressed or...? 🫦',
        scene: 'sitting on edge of bed, wearing jeans or shorts with just bra on top, natural morning light from nearby window, one hand running through hair or adjusting outfit, soft intimate bedroom setting, casual vulnerable moment, side or front angle, authentic candid feel, messy bed visible behind',
        mood: 'attention',
        color_scheme: 'black',
        lighting: 'natural'
    },
    {
        id: 'arched_back_mirror',
        title: 'Yoga Pants Check 🍑',
        caption: 'these yoga pants might be too much for the gym 👀 but they make my ass look incredible...be honest do they make you hard? I need to know 🍑',
        scene: 'full-body mirror selfie from behind, wearing fitted yoga pants or athletic leggings, sports bra or tight workout top, back naturally arched, looking back over shoulder at camera, bedroom or home gym setting, natural lighting, fitness aesthetic, phone held over shoulder',
        mood: 'attention',
        color_scheme: 'black',
        lighting: 'natural'
    },
    {
        id: 'sheer_robe_window',
        title: 'Morning Light ☀️',
        caption: 'sunrise hits different when you\'re naked under this robe 🌅 the light makes me feel so sexy...wish you could see what I see right now baby 💕',
        scene: 'standing by large window, wearing sheer silk robe or thin oversized shirt, soft morning backlighting creating ethereal glow, looking out window or back at camera, dreamy peaceful vibe, natural warm light highlighting silhouette, intimate private moment, bedroom setting',
        mood: 'attention',
        color_scheme: 'white',
        lighting: 'golden-hour',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'laying_stomach_profile',
        title: 'Sunday Mood 😴',
        caption: 'zero plans today except laying here thinking about you 🛏️ the bed feels so empty without you...when are you coming over to keep me company? 🥺',
        scene: 'lying flat on stomach across bed, propped up on elbows, looking directly at camera, wearing minimal clothing or comfortable loungewear, side profile showing natural curves, messy sheets and pillows, soft bedroom lighting, intimate inviting energy, girlfriend-experience vibe, phone on pillow or bed',
        mood: 'attention',
        color_scheme: 'natural',
        lighting: 'warm-2700K'
    },
    {
        id: 'lace_bralette_jeans',
        title: 'Detail Check 🔍',
        caption: 'obsessed with this lace piece 💭 the details are so delicate and sexy...makes me feel like a goddess. do you think I should wear it for you? tell me yes 🖤',
        scene: 'mirror selfie wearing delicate lace bralette or lingerie top with high-waisted jeans, casual-sexy aesthetic, bedroom or bathroom setting, one hand on hip or in hair, natural confident pose, soft lighting highlighting lace details, intimate but approachable vibe, focus on elegant femininity',
        mood: 'attention',
        color_scheme: 'black',
        lighting: 'soft'
    },

    // 💎 NEW RESEARCH-BACKED POSES (From Perplexity - Top 10 Most Profitable)

    {
        id: 's_curve_standing',
        title: 'Curves on Display 💃',
        caption: 'standing here feeling myself 💃 this pose makes my curves look insane...does it make you want to touch? be honest with me baby 🫦',
        scene: 'standing full body shot, S-curve pose with one knee bent slightly and torso twisted creating S-shaped curve of body, elegant look emphasizing natural curves, wearing lingerie or form-fitting outfit, soft natural lighting, sense of motion and energy, amateur phone quality, bedroom or neutral background',
        mood: 'attention',
        color_scheme: 'red',
        lighting: 'soft'
    },
    {
        id: 'leaning_forward_tease',
        title: 'Lean In Close 😘',
        caption: 'leaning in so you can see better 😘 wish you could reach out and touch...would you grab me or be gentle? tell me what you\'d do 💭',
        scene: 'body perpendicular to camera, leaning slightly forward towards camera, emphasis on chest area naturally, intimate and engaging angle, wearing low-cut top or lingerie, shot from varying angles, glamour classic pose, soft lighting, bedroom or intimate setting',
        mood: 'spicy',
        color_scheme: 'red',
        lighting: 'warm-3000K'
    },
    {
        id: 'hands_above_head_stretch',
        title: 'Morning Stretch 🌤️',
        caption: 'stretching and feeling so good right now 🌤️ my body is so sensitive when I wake up...wish your hands were on me instead of mine 😈',
        scene: 'standing or lying down, hands held above head with one hand clasping other wrist, elongated body line creating elegant vulnerable aesthetic, wearing minimal clothing or lingerie, soft morning light, glamorous slightly sensual vibe, high vantage point if lying down',
        mood: 'spicy',
        color_scheme: 'white',
        lighting: 'natural'
    },
    {
        id: 'three_quarter_allure',
        title: 'Turn Around 🔄',
        caption: 'caught me turning around 🔄 do you prefer this view or when I\'m facing you? I can\'t decide which side is sexier...help me choose 👀',
        scene: 'three-quarter pose with hips facing away from camera and shoulders turned towards camera, alluring pose capturing both face and profile, interesting dimension, natural not contorted positioning, wearing form-fitting outfit or lingerie, soft lighting, transitional easy pose',
        mood: 'teasing',
        color_scheme: 'purple',
        lighting: 'soft'
    },
    {
        id: 'confident_pose_variations',
        title: 'Feeling Confident 💪',
        caption: 'feeling SO confident today 💪 one hand on my hip the other in my hair...I feel like a goddess right now. do I look as good as I feel? 🔥',
        scene: 'facing camera, weight shifted creating s-curve, one hand on hip and other behind head, exquisite glamorous shot with many variations, confident assertive aesthetic, dynamic positioning with natural movement, wearing lingerie or casual-sexy outfit, soft dramatic lighting',
        mood: 'attention',
        color_scheme: 'black',
        lighting: 'dramatic'
    },
    {
        id: 'sitting_knees_up_intimate',
        title: 'Cozy Vibes 🌸',
        caption: 'sitting here alone thinking about you 🌸 my knees pulled up feeling so vulnerable...would you come sit with me? I need someone close 🥺',
        scene: 'sitting on floor, chair, or bed with knees brought toward chest, arms crossed and resting on knees, intimate casual vibe, works in various settings, soft natural lighting from above or side, cozy comfortable aesthetic, foreground elements possible, camera at subject level',
        mood: 'authentic',
        color_scheme: 'pink',
        lighting: 'soft'
    },
    {
        id: 'lying_side_curves',
        title: 'Lazy Afternoon 😴',
        caption: 'just lying here feeling lazy 😴 my curves look so good in this position don\'t they? imagine laying behind me right now...what would you do? 😏',
        scene: 'lying on side, body elongated completely and centered in frame, classic reclining pose showing curves while maintaining coverage, open legs position suggesting vulnerability, natural relaxed aesthetic, intimate bedroom-style setting, soft side lighting, messy sheets and pillows',
        mood: 'spicy',
        color_scheme: 'natural',
        lighting: 'warm-2700K'
    },
    {
        id: 'back_camera_mystery',
        title: 'Guess What? 🎁',
        caption: 'can you guess what I\'m wearing under this? 🎁 I\'ll give you a hint...not much. should I turn around and show you or keep you guessing? 😈',
        scene: 'facing away from camera with optional look back over shoulder, creates intrigue and mystery, emphasis on posterior curves, teasing without revealing everything, wearing form-fitting clothes or minimal coverage, natural lighting, look back adds engagement element',
        mood: 'teasing',
        color_scheme: 'black',
        lighting: 'natural'
    },
    {
        id: 'sitting_arched_glamour',
        title: 'Sit Pretty 👑',
        caption: 'sitting here arching my back like this makes me feel so sexy 👑 the way it makes my body look...I bet you wish you were here to appreciate it in person 🫦',
        scene: 'sitting parallel to camera, legs pointed forward, arms behind supporting weight, back arched slightly upward, glamorous pose demonstrating physique showcasing body shape, versatile with different head positions, creates silhouette opportunities, soft backlighting, bedroom or studio setting',
        mood: 'attention',
        color_scheme: 'purple',
        lighting: 'dramatic'
    },
    {
        id: 'over_shoulder_classic_red',
        title: 'Looking Back 😏',
        caption: 'looking back at you like this 😏 the way my shoulder looks...my jaw line...everything feels so right in this moment. are you looking at my face or...lower? 👀',
        scene: 'turning away so shoulder is prominent then looking back at camera, creates flirty mysterious look universally appealing, accentuates angles in face and shoulders making jaw line more pronounced, shot from slightly above face level, wearing red or black lingerie, classic pose that works in most situations, professional lighting',
        mood: 'attention',
        color_scheme: 'red',
        lighting: 'dramatic'
    },

    // 💰 PPV EXCLUSIVE (Premium Explicit Content - $10-25/photo tier)
    // Based on research: Nude content generates most revenue when positioned as premium PPV

    {
        id: 'topless_bed_reveal',
        title: 'Just For You 🔥',
        caption: 'took these off just for you baby 🔥 my tits look so good right now...wanna see me play with them? unlock this and I\'ll show you everything 💦',
        scene: 'lying on back in bed, topless, hands near breasts, sultry expression looking directly at camera, messy sheets, warm intimate lighting, emphasis on chest area, soft shadows creating depth, amateur bedroom aesthetic, phone held above',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'warm-2700K',
        optimal_time: '6-10 PM',
        best_days: ['Friday', 'Sunday'],
        time_window: 'evening-money'
    },
    {
        id: 'nude_shower_wet',
        title: 'Shower Show 💦',
        caption: 'thought about you in the shower 💦 got so turned on I had to take this...my body is dripping wet and I\'m touching myself. wanna watch? 😈',
        scene: 'standing in shower, water running over body, completely nude, wet hair, water droplets on skin, hand touching body suggestively, steamy glass, soft bathroom lighting, intimate vulnerable moment, looking at camera with desire',
        mood: 'ppv',
        color_scheme: 'natural',
        lighting: 'soft'
    },
    {
        id: 'bent_over_explicit',
        title: 'Best View 🍑',
        caption: 'this is the view you\'ve been begging for 🍑 bent over just how you like it...my ass looks incredible from this angle. should I spread it for you? tell me yes 👀',
        scene: 'bent over on bed on all fours, looking back over shoulder, completely nude, emphasis on posterior curves, bedroom setting, warm dramatic lighting from behind creating silhouette, intimate explicit positioning, professional quality amateur vibe',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'dramatic'
    },
    {
        id: 'spread_legs_explicit',
        title: 'Open For You 😈',
        caption: 'spreading my legs wide open for you 😈 can you see how wet I am? this is what you do to me baby...unlock to see EVERYTHING 🥵',
        scene: 'lying on back, legs spread open, completely nude, intimate explicit view, soft bedroom lighting, vulnerable positioning, looking at camera with sultry expression, messy bed sheets, phone positioned for full view, warm intimate atmosphere',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'warm-3000K'
    },
    {
        id: 'touching_myself_bed',
        title: 'Cant Help It 💦',
        caption: 'couldn\'t help myself thinking about you 💦 had to touch myself right here...my fingers feel so good. wish it was your cock instead baby 🔥',
        scene: 'lying on bed, nude, hand between legs touching intimately, eyes closed in pleasure, messy hair, bedroom setting, dramatic side lighting, intimate explicit moment, amateur phone quality, authentic desire expression',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'dramatic'
    },
    {
        id: 'full_frontal_mirror',
        title: 'All Of Me 🫦',
        caption: 'here\'s ALL of me baby 🫦 completely naked showing you everything...my body is yours. what would you do to me if you were here? I need to know 😈',
        scene: 'standing in front of mirror completely nude, full frontal view, confident pose, one hand in hair, bedroom or bathroom setting, soft natural lighting, full body visible, intimate revealing moment, phone held at waist level',
        mood: 'ppv',
        color_scheme: 'black',
        lighting: 'natural'
    },
    {
        id: 'close_up_intimate',
        title: 'So Close 👀',
        caption: 'getting REAL close so you can see everything 👀 look how pink and perfect I am...bet you wish you could taste me right now don\'t you? 💦',
        scene: 'extreme close-up intimate shot, nude, lying on back with legs spread, detailed explicit view, soft warm lighting, emphasis on intimate details, bedroom setting, vulnerable explicit positioning, amateur aesthetic',
        mood: 'ppv',
        color_scheme: 'pink',
        lighting: 'warm-3000K'
    },
    {
        id: 'oil_massage_nude',
        title: 'Oil Me Up 💧',
        caption: 'rubbing oil all over my naked body 💧 my skin is glistening and I\'m so slippery...wish these were your hands on me. unlock and watch me touch myself 🔥',
        scene: 'nude lying on bed or sitting, applying oil to body, glistening skin, hands gliding over curves, sultry expression, bedroom setting, warm dramatic lighting highlighting shine, sensual explicit moment, emphasis on curves',
        mood: 'ppv',
        color_scheme: 'natural',
        lighting: 'dramatic'
    },
    {
        id: 'ass_spread_explicit',
        title: 'Spread Wide 🍑',
        caption: 'spreading my ass wide just for you 🍑 this is as explicit as it gets baby...can you see both my holes? wanna fill them up? 😈',
        scene: 'hands spreading buttocks apart, bent over position, explicit rear view showing everything, nude, bedroom setting, dramatic lighting from above, intimate explicit positioning, amateur phone quality, vulnerable exposure',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'dramatic'
    },
    {
        id: 'riding_position_pov',
        title: 'Your POV 👑',
        caption: 'this is your view when I ride you 👑 imagine me bouncing on your cock like this...my tits in your face. unlock to see me move for you baby 🔥',
        scene: 'nude straddling position from POV angle looking up, breasts prominent in frame, hands on hips or chest, bedroom setting, dramatic lighting from below, explicit suggestive positioning, amateur authentic vibe',
        mood: 'ppv',
        color_scheme: 'red',
        lighting: 'dramatic'
    },
];



export const SHARED_SCENES: Scene[] = [...TWENTY_TWENTY_FIVE_META, ...VIRAL_SCENES, ...CORE_SCENES];

// Character-specific appearance tags
export const CHARACTER_TAGS = {
    emily: 'platinum blonde hair with natural roots, light blue-grey eyes, Scandinavian features, pale white skin, Danish look, very minimal makeup, fresh natural appearance, cute girl-next-door',
    thale: 'brunette hair, dark features, cute petite appearance, delicate features, youthful look, minimal makeup, natural beauty, girl-next-door charm'
};

// Moods/Themes for both personas
export const CONTENT_MOODS = [
    { name: 'authentic', desc: 'Natural, relatable, genuine', icon: '✨' },
    { name: 'teasing', desc: 'Playful, flirty, suggestive', icon: '😏' },
    { name: 'spicy', desc: 'Sultry, seductive, intimate', icon: '🔥' },
    { name: 'emotional', desc: 'Moody, cinematic, deep', icon: '🎞️' },
    { name: 'attention', desc: 'Viral bait, thirst traps', icon: '🍑' },
    { name: 'ppv', desc: 'Explicit, premium revenue', icon: '💰' },
    { name: 'lifestyle', desc: 'Daily life, casual, cozy', icon: '🏠' },
    { name: 'banner', desc: 'Profile headers & banners', icon: '🖼️' }
];
