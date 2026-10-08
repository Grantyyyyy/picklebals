import type { NextConfig } from "next";

function supabaseImagePattern(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { protocol, hostname, port } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // The venue seed is read at runtime only when Supabase is not configured (local previews).
  outputFileTracingIncludes: {
    "/venues": ["./data/seeds/iligan_pickleball_venues_seed.json"],
    "/venues/[slug]": ["./data/seeds/iligan_pickleball_venues_seed.json"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseImagePattern(),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
