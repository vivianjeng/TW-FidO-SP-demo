import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root: this repo's own package-lock.json sits next to an
  // unrelated one in the parent GitHub/ directory, which Next.js would otherwise
  // guess at and warn about.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
