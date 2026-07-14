import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin root so Turbopack finds next/ when multiple lockfiles confuse inference
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
