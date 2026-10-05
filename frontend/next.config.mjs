/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the dev-only indicator clear of the app sidebar's footer links.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
