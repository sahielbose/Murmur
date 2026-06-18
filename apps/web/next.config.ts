import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the TypeScript-source workspace packages (no build step).
  transpilePackages: ["@murmur/ai", "@murmur/db", "@murmur/jobs"],
};

export default nextConfig;
