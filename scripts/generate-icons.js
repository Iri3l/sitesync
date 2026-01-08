// Script to generate PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG icon template
const createSVG = (size, maskable = false) => {
  const padding = maskable ? size * 0.1 : 0;
  const innerSize = size - (padding * 2);
  const scale = innerSize / 40;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${maskable ? `<rect width="${size}" height="${size}" fill="#f97316"/>` : ''}
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="50%" stop-color="#ea580c" />
        <stop offset="100%" stop-color="#c2410c" />
      </linearGradient>
      <linearGradient id="buildingGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>
    </defs>
    
    <circle cx="20" cy="20" r="19" fill="${maskable ? 'white' : 'url(#logoGradient)'}" />
    
    <path
      d="M12 28V16L20 10L28 16V28H12Z"
      fill="${maskable ? '#ea580c' : 'url(#buildingGradient)'}"
      stroke="${maskable ? '#c2410c' : 'white'}"
      stroke-width="1.5"
    />
    
    <rect x="15" y="18" width="3" height="3" fill="${maskable ? 'white' : '#f97316'}" rx="0.5" />
    <rect x="22" y="18" width="3" height="3" fill="${maskable ? 'white' : '#f97316'}" rx="0.5" />
    <rect x="18" y="23" width="4" height="5" fill="${maskable ? 'white' : '#f97316'}" rx="0.5" />
    
    <path d="M32 14C32 14 30 12 27 12" stroke="white" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M32 14L30 11M32 14L29 15" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" />
    
    <path d="M8 26C8 26 10 28 13 28" stroke="white" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M8 26L10 29M8 26L11 25" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </g>
</svg>`;
};

const publicDir = path.join(__dirname, '..', 'public');

// Generate SVG icons (browsers will render them correctly)
const sizes = [192, 512];

sizes.forEach(size => {
  // Regular icon
  const regularSVG = createSVG(size, false);
  fs.writeFileSync(path.join(publicDir, `icon-${size}.svg`), regularSVG);
  console.log(`Created icon-${size}.svg`);
  
  // Maskable icon (for Android adaptive icons)
  const maskableSVG = createSVG(size, true);
  fs.writeFileSync(path.join(publicDir, `icon-maskable-${size}.svg`), maskableSVG);
  console.log(`Created icon-maskable-${size}.svg`);
});

// Also create a 180x180 apple touch icon
const appleSVG = createSVG(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleSVG);
console.log('Created apple-touch-icon.svg');

console.log('\\nAll icons generated successfully!');
console.log('Note: For best PWA support, consider converting these SVGs to PNGs using an image tool.');
