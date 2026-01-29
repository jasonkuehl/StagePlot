# Stage Backgrounds

Drop stage background images here and they'll appear in the dropdown!

## Supported Formats
- PNG, JPG, JPEG, GIF, SVG, WEBP

## Naming
The filename becomes the display name:
- `main-hall.png` → "Main Hall"
- `outdoor_festival.png` → "Outdoor Festival"
- `my venue.png` → "My Venue"

## Adding Images

### For GitHub Pages (Static Hosting)
Add your image filenames to `manifest.json`:
```json
{
  "description": "Stage background images",
  "images": [
    "main-stage.png",
    "outdoor-festival.jpg",
    "small-venue.png"
  ]
}
```

### For Local/nginx (with directory listing)
Just drop the files here - they'll be auto-discovered!

## Tips
- Stage outlines/floor plans work best
- Transparent backgrounds (PNG) let the grid show through
- Include dimensions or markers if helpful
- Recommended size: match your stage area (800x600 or similar)
