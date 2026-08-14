import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin root so Turbopack finds next/ when multiple lockfiles confuse inference.
  // NB: next.config.ts di-load sebagai ES module, jadi __dirname tidak tersedia —
  // gunakan import.meta.dirname (Node 20.11+ / Bun).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
