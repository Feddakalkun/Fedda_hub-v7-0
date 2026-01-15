// Generate Emily Hero Image for Intro Page
const fs = require('fs');
const path = require('path');
const http = require('http');

const COMFYUI_URL = 'http://localhost:8188';

// Load the z-image workflow
const workflowPath = path.join(__dirname, '../public/comfyui/workflows/z-image_workflow_v2.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));

// Emily hero prompt - stunning studio portrait
const heroPrompt = `Scandinavian young woman, platinum blonde hair, light blue-grey Nordic eyes, 
pale porcelain skin, natural minimal makeup, professional studio photography, 
ultra high quality studio lighting, dramatic key light, soft rim light,
solid pure black background, fashion photography style, 
slight mysterious smile, confident direct gaze at camera,
close-up portrait, crystal clear 8K, hyper realistic, 
RAW photo, ultra detailed skin texture, visible pores,
soft flyaway hair catching light, elegant collarbone visible,
professional beauty campaign aesthetic, magazine cover quality`;

const negativePrompt = `ugly, deformed, noisy, blurry, low quality, cartoon, anime, 
3d, painting, drawing, illustration, bad anatomy, bad proportions, 
cloned face, disfigured, extra limbs, missing limbs`;

// Modify workflow with our prompt
// Node 131 = ImpactWildcardProcessor (positive prompt)
// Node 171 = easy negative (negative prompt)
// Node 169 = Power Lora Loader

if (workflow['131']) {
    workflow['131'].inputs.populated_text = heroPrompt;
}

if (workflow['169']) {
    workflow['169'].inputs['lora_1'] = {
        on: true,
        lora: 'r3v3rs3_c0wg1rlfivan22.r3v3rs3_c0wg1rl-14b-High-i2v_e70.safetensors',
        strength: 1.0,
        strength_clip: 1.0,
    };
}

// Set to portrait aspect ratio (2:3 vertical for hero)
if (workflow['170']) {
    workflow['170'].inputs.width = 832;
    workflow['170'].inputs.height = 1216;
}

// Queue the prompt
const promptData = {
    prompt: workflow,
    client_id: 'hero_generator_' + Date.now()
};

const postData = JSON.stringify(promptData);

const options = {
    hostname: 'localhost',
    port: 8188,
    path: '/prompt',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🎨 Generating Emily Hero Image...');
console.log('📝 Prompt:', heroPrompt.substring(0, 100) + '...');

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        console.log('✅ Queued! Prompt ID:', result.prompt_id);
        console.log('⏳ Image generating... Check ComfyUI for progress');
        console.log('📁 Output will be in ComfyUI output folder');
    });
});

req.on('error', (e) => {
    console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
