# Emmy - Demo Character

Emmy is included as a **free demo character** to help you get started with Fedda Hub.

## Quick Start

1. **Download Emmy's files:**
   ```
   download-emmy-demo.bat
   ```

2. **Create Emmy character in the app:**
   - Open Fedda Hub (`run.bat`)
   - Go to **Characters** page
   - Click **Create New Character**
   - Name: `Emmy`
   - LoRA Path: `Emmy/Emmy.safetensors`
   - Description: Copy from `ComfyUI/models/loras/Emmy/Emmy.txt`

3. **Generate your first avatar:**
   - Click on Emmy in the Characters list
   - Click **Generate Avatar**
   - Wait for the image to generate (first time takes longer due to model downloads)

## Files Downloaded

- `Emmy.safetensors` - Character LoRA model
- `Emmy.txt` - Character description and prompting guide

## Example Prompts

See `Emmy.txt` for optimal prompting examples and character details.

## Notes

- Emmy is free to use for testing
- First generation may take 5-10 minutes (downloading base models)
- Subsequent generations are much faster (30-60 seconds)

## Troubleshooting

**Download fails?**
- Check internet connection
- Manually download from: https://drive.google.com/drive/folders/1x-gdYcmsVpT1ZFTFwPsJaHhm09eRrVll
- Place files in: `ComfyUI/models/loras/Emmy/`

**Generation fails?**
- Make sure LoRA path is exactly: `Emmy/Emmy.safetensors`
- Check ComfyUI console for errors
- Ensure base models downloaded successfully

Enjoy! 🎭
