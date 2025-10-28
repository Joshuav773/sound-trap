import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@server': path.resolve(__dirname, 'server'),
      '@shared': path.resolve(__dirname, 'shared'),
    };
    
    return config;
  },
};

export default nextConfig;

