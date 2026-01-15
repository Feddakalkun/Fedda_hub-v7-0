import json
import sys

def sanitize_wan_workflow(filepath):
    """Sanitize Wan workflow by removing personal data"""
    with open(filepath, 'r', encoding='utf-8') as f:
        workflow = json.load(f)
    
    # Reset seeds to 0
    for node_id, node in workflow.items():
        if 'inputs' in node:
            inputs = node['inputs']
            # Reset seeds
            if 'seed' in inputs:
                inputs['seed'] = 0
            if 'noise_seed' in inputs:
                inputs['noise_seed'] = 0
                
            # Clean LoRA loader nodes
            if node.get('class_type') == 'Power Lora Loader (rgthree)':
                for i in range(2, 27):  # lora_2 through lora_26
                    lora_key = f'lora_{i:02d}' if i < 10 else f'lora_{i}'
                    if lora_key in inputs:
                        inputs[lora_key] = {
                            'on': False,
                            'lora': 'None',
                            'strength': 1
                        }
            
            # Clean explicit text prompts
            if 'text' in inputs and isinstance(inputs['text'], str):
                if len(inputs['text']) > 200 or 'personal' in inputs['text'].lower():
                    inputs['text'] = 'Enter your prompt here'
            
            # Clean file paths
            if 'path' in inputs and isinstance(inputs['path'], str):
                if 'D:\\' in inputs['path'] or 'personal' in inputs['path'].lower():
                    inputs['path'] = ''
            
            # Clean image filenames with personal data
            if 'image' in inputs and isinstance(inputs['image'], str):
                if 'sendtoworkflow' in inputs['image'] or 'personal' in inputs['image'].lower():
                    inputs['image'] = 'input_image.png'
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2)
    
    print(f'✓ Sanitized {filepath}')

if __name__ == '__main__':
    sanitize_wan_workflow(r'h:\00001.app\latest-release-150126\assets\workflows\Wan2.2_I2V.json')
    sanitize_wan_workflow(r'h:\00001.app\latest-release-150126\assets\workflows\Wan2.2_T2V.json')
    print('All Wan2.2 workflows sanitized!')
