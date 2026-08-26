import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Demo avatars/photos come from these hosts; next/image needs them allowed.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  // Keep the dev overlay badge out of the preview iframes.
  devIndicators: false,
  // Gallery pages read src/registry from disk at request time, so a newly
  // dropped-in component file shows up without restarting the dev server.
  //
  // That read is a runtime fs.readdir on process.cwd(), which Next cannot
  // statically analyse — so without this the registry sources are left out of
  // the serverless bundle and every gallery page deploys empty. Works locally,
  // fails only once deployed, which is the worst way to find out.
  outputFileTracingIncludes: {
    "/": ["./src/registry/**/*"],
    "/[category]": ["./src/registry/**/*"],
    "/[category]/[slug]": ["./src/registry/**/*"],
    "/preview/[category]/[slug]": ["./src/registry/**/*"],
  },
};

export default nextConfig;
