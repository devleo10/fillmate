# Icon Generation Guide

Since we can't generate actual PNG files programmatically, here's how to create the required icons:

## Required Icon Sizes
- 16x16 pixels (icon16.png)
- 32x32 pixels (icon32.png) 
- 48x48 pixels (icon48.png)
- 128x128 pixels (icon128.png)

## Creating Icons

### Option 1: Use the SVG (Recommended)
1. Open the `icon.svg` file in a vector graphics editor like:
   - Inkscape (free)
   - Adobe Illustrator
   - Figma (online, free)
   - Canva (online)

2. Export the SVG as PNG in the required sizes:
   - 16x16 → icon16.png
   - 32x32 → icon32.png
   - 48x48 → icon48.png
   - 128x128 → icon128.png

### Option 2: Online Converters
1. Use online SVG to PNG converters like:
   - cloudconvert.com
   - convertio.co
   - svg2png.com

2. Upload the icon.svg file
3. Convert to PNG at each required size

### Option 3: Create Simple Icons
If you want to create quick placeholder icons:

1. Create a 128x128 canvas with a gradient background (blue to purple)
2. Add a white lightning bolt symbol ⚡
3. Add "HB" text in white
4. Export as PNG in all required sizes

## Design Guidelines
- Use the gradient: #667eea to #764ba2
- White lightning bolt symbol for instant recognition
- Clean, modern design that works at small sizes
- Ensure 16x16 icon is still readable

## Color Scheme
- Primary gradient: Blue (#667eea) to Purple (#764ba2)
- Accent: White (#ffffff)
- Text: Dark gray (#333333) for contrast on light backgrounds

Once you have the PNG files, place them in the icons/ folder:
```
icons/
├── icon16.png
├── icon32.png
├── icon48.png
├── icon128.png
└── icon.svg (source file)
```
