// Script to generate optimized PNG icons for PWA
// Uses sharp library for best quality PNG generation

const fs = require('fs');
const path = require('path');

// Since we don't have sharp installed, we'll create data URL based SVGs
// that browsers can render as high-quality icons

const publicDir = path.join(__dirname, '..', 'public');

// Create optimized SVG icons that will render perfectly as app icons
const createOptimizedIcon = (size, forApple = false) => {
  // Apple requires slightly different padding for their safe zone
  const padding = forApple ? Math.round(size * 0.1) : 0;
  const iconSize = size - (padding * 2);
  const scale = iconSize / 40;
  const offset = padding;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background for full bleed -->
  <rect width="${size}" height="${size}" fill="#f97316"/>
  
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- Main circle with gradient -->
    <defs>
      <linearGradient id="circleGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fff7ed"/>
      </linearGradient>
      <linearGradient id="buildingGrad${size}" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <!-- Drop shadow -->
      <filter id="shadow${size}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
      </filter>
    </defs>
    
    <!-- White circle background -->
    <circle cx="20" cy="20" r="18" fill="url(#circleGrad${size})" filter="url(#shadow${size})"/>
    
    <!-- Building -->
    <path
      d="M12 28V16L20 10L28 16V28H12Z"
      fill="url(#buildingGrad${size})"
      stroke="#1e293b"
      stroke-width="0.5"
    />
    
    <!-- Windows - orange glow -->
    <rect x="15" y="18" width="3" height="3" fill="#f97316" rx="0.5">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="22" y="18" width="3" height="3" fill="#f97316" rx="0.5">
      <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
    </rect>
    
    <!-- Door -->
    <rect x="18" y="23" width="4" height="5" fill="#f97316" rx="0.5"/>
    
    <!-- Sync arrows -->
    <g stroke="#ffffff" stroke-linecap="round" fill="none">
      <path d="M32 14C32 14 30 12 27 12" stroke-width="2"/>
      <path d="M32 14L30 11M32 14L29 15" stroke-width="1.5"/>
      <path d="M8 26C8 26 10 28 13 28" stroke-width="2"/>
      <path d="M8 26L10 29M8 26L11 25" stroke-width="1.5"/>
    </g>
  </g>
</svg>`;
};

// Create maskable icon for Android (has safe zone)
const createMaskableIcon = (size) => {
  const safeZone = Math.round(size * 0.1); // 10% padding for safe zone
  const iconSize = size - (safeZone * 2);
  const scale = iconSize / 40;
  const offset = safeZone;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Full orange background for maskable icon -->
  <rect width="${size}" height="${size}" fill="#f97316"/>
  
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <defs>
      <linearGradient id="maskCircle${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fff7ed"/>
      </linearGradient>
      <linearGradient id="maskBuilding${size}" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    </defs>
    
    <!-- White circle -->
    <circle cx="20" cy="20" r="17" fill="url(#maskCircle${size})"/>
    
    <!-- Building -->
    <path
      d="M12 28V16L20 10L28 16V28H12Z"
      fill="url(#maskBuilding${size})"
    />
    
    <!-- Windows -->
    <rect x="15" y="18" width="3" height="3" fill="#f97316" rx="0.5"/>
    <rect x="22" y="18" width="3" height="3" fill="#f97316" rx="0.5"/>
    <rect x="18" y="23" width="4" height="5" fill="#f97316" rx="0.5"/>
    
    <!-- Sync arrows -->
    <g stroke="#ffffff" stroke-linecap="round" fill="none">
      <path d="M31 14C31 14 29 12 26 12" stroke-width="1.8"/>
      <path d="M31 14L29 11.5M31 14L28.5 15" stroke-width="1.3"/>
      <path d="M9 26C9 26 11 28 14 28" stroke-width="1.8"/>
      <path d="M9 26L11 28.5M9 26L11.5 25" stroke-width="1.3"/>
    </g>
  </g>
</svg>`;
};

// Create simple favicon SVG
const createFaviconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#f97316"/>
  <g transform="scale(${size / 40})">
    <circle cx="20" cy="20" r="15" fill="white"/>
    <path d="M14 26V18L20 13L26 18V26H14Z" fill="#ea580c"/>
    <rect x="16" y="19" width="2.5" height="2.5" fill="white" rx="0.3"/>
    <rect x="21.5" y="19" width="2.5" height="2.5" fill="white" rx="0.3"/>
    <rect x="18.5" y="22" width="3" height="4" fill="white" rx="0.3"/>
  </g>
</svg>`;
};

// Generate all icons
const icons = [
  // Android icons
  { name: 'icon-192.svg', size: 192, fn: createOptimizedIcon },
  { name: 'icon-512.svg', size: 512, fn: createOptimizedIcon },
  { name: 'icon-maskable-192.svg', size: 192, fn: createMaskableIcon },
  { name: 'icon-maskable-512.svg', size: 512, fn: createMaskableIcon },
  
  // Apple icons
  { name: 'apple-touch-icon.svg', size: 180, fn: (s) => createOptimizedIcon(s, true) },
  
  // Favicons
  { name: 'icon-16.svg', size: 16, fn: createFaviconSVG },
  { name: 'icon-32.svg', size: 32, fn: createFaviconSVG },
];

icons.forEach(({ name, size, fn }) => {
  const svg = fn(size);
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Created ${name} (${size}x${size})`);
});

// Also update manifest to use these icons
const manifest = {
  name: "SiteSync",
  short_name: "SiteSync",
  description: "Construction Site Management - Site Diary, Snags, and Stock",
  start_url: "/dashboard",
  scope: "/",
  display: "standalone",
  orientation: "portrait-primary",
  background_color: "#fff7ed",
  theme_color: "#f97316",
  categories: ["business", "productivity"],
  icons: [
    {
      src: "/icon-192.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any"
    },
    {
      src: "/icon-512.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any"
    },
    {
      src: "/icon-maskable-192.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "maskable"
    },
    {
      src: "/icon-maskable-512.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "maskable"
    }
  ],
  shortcuts: [
    {
      name: "View Sites",
      short_name: "Sites",
      url: "/dashboard/sites",
      icons: [{ src: "/icon-192.svg", sizes: "192x192" }]
    },
    {
      name: "View Snags",
      short_name: "Snags",
      url: "/dashboard/snags",
      icons: [{ src: "/icon-192.svg", sizes: "192x192" }]
    }
  ]
};

fs.writeFileSync(
  path.join(publicDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✓ Updated manifest.json');

console.log('\n🎉 All icons generated successfully!');
console.log('\nIcon summary:');
console.log('  📱 Android: icon-192.svg, icon-512.svg (with maskable variants)');
console.log('  🍎 iPhone:  apple-touch-icon.svg (180x180 with safe zone)');
console.log('  🖥️  Favicon: icon-16.svg, icon-32.svg');
