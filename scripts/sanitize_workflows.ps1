$ErrorActionPreference = "Stop"

function Sanitize-WanWorkflow {
    param([string]$FilePath)
    
    Write-Host "Sanitizing $FilePath..."
    
    $json = Get-Content $FilePath -Raw | ConvertFrom-Json
    
    foreach ($nodeId in $json.PSObject.Properties.Name) {
        $node = $json.$nodeId
        
        if ($node.inputs) {
            # Reset seeds
            if ($node.inputs.seed) {
                $node.inputs.seed = 0
            }
            if ($node.inputs.noise_seed) {
                $node.inputs.noise_seed = 0
            }
            
            # Clean LoRA nodes
            if ($node.class_type -eq 'Power Lora Loader (rgthree)') {
                for ($i = 2; $i -le 26; $i++) {
                    $loraKey = if ($i -lt 10) { "lora_0$i" } else { "lora_$i" }
                    if ($node.inputs.$loraKey) {
                        $node.inputs.$loraKey = @{
                            on = $false
                            lora = 'None'
                            strength = 1
                        }
                    }
                }
            }
            
            # Clean prompts
            if ($node.inputs.text -and $node.inputs.text.Length -gt 200) {
                $node.inputs.text = 'Enter your prompt here'
            }
            
            # Clean paths
            if ($node.inputs.path -and ($node.inputs.path -like '*D:\*' -or $node.inputs.path -like '*personal*')) {
                $node.inputs.path = ''
            }
            
            # Clean image filenames
            if ($node.inputs.image -and ($node.inputs.image -like '*sendtoworkflow*' -or $node.inputs.image -like '*personal*')) {
                $node.inputs.image = 'input_image.png'
            }
        }
    }
    
    # Write back with proper formatting
    $json | ConvertTo-Json -Depth 100 | Set-Content $FilePath -Encoding UTF8
    Write-Host "✓ Sanitized $FilePath"
}

# Sanitize both files
Sanitize-WanWorkflow -FilePath 'h:\00001.app\latest-release-150126\assets\workflows\Wan2.2_I2V.json'
Sanitize-WanWorkflow -FilePath 'h:\00001.app\latest-release-150126\assets\workflows\Wan2.2_T2V.json'

Write-Host "`n✓ All Wan2.2 workflows sanitized!" -ForegroundColor Green
