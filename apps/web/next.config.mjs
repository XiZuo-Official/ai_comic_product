/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ai-comic/config", "@ai-comic/db", "@ai-comic/projects", "@ai-comic/ui", "@ai-comic/utils"]
};

export default nextConfig;
