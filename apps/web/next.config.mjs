/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ai-comic/auth",
    "@ai-comic/ai",
    "@ai-comic/assets",
    "@ai-comic/billing",
    "@ai-comic/characters",
    "@ai-comic/comic-studio",
    "@ai-comic/config",
    "@ai-comic/credits",
    "@ai-comic/db",
    "@ai-comic/export",
    "@ai-comic/ideas",
    "@ai-comic/projects",
    "@ai-comic/storage",
    "@ai-comic/ui",
    "@ai-comic/utils"
  ]
};

export default nextConfig;
