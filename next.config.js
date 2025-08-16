/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // creates /out with static HTML
  images: { unoptimized: true }, // safe for <img> usage
};

module.exports = nextConfig;
