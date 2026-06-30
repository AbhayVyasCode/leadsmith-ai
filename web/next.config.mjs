/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Persist Turbopack's compiler artifacts to .next between dev restarts, so a
    // route that compiled once restores in <1s instead of recompiling cold.
    // Stable for dev as of Next 16; set explicitly to document intent.
    turbopackFileSystemCacheForDev: true,
    // Tree-shake heavy barrel packages so a single named import (e.g. one Lucide
    // icon) doesn't pull the whole module graph into each route's bundle.
    optimizePackageImports: ["lucide-react", "@xyflow/react", "cmdk"],
  },
};

export default nextConfig;
