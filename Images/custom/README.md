# Custom Equipment

Drop equipment images here and they'll appear in a "Custom" category!

## Supported Formats
- PNG, JPG, JPEG, GIF, SVG, WEBP

## Naming
The filename becomes the display name:
- `wireless-mic.png` → "Wireless Mic"
- `stage_riser.png` → "Stage Riser"
- `my speaker.png` → "My Speaker"

## Adding Images

### For GitHub Pages (Static Hosting)
Add your image filenames to `manifest.json`:
```json
{
  "description": "Custom equipment images",
  "images": [
    "wireless-mic.png",
    "stage-riser.png",
    "custom-speaker.png"
  ]
}
```

### For Local/nginx (with directory listing)
Just drop the files here - they'll be auto-discovered!

## Tips
- Recommended size: 60x60 to 100x100 pixels
- Transparent backgrounds (PNG) look best on stage
- Use descriptive filenames for searchability

## Search
Custom equipment is searchable - search by filename words.
