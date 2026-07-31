import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@repo/database", "@repo/ui", "@repo/tailwind-config"],
  serverExternalPackages: ["@prisma/client"],
  typescript: {
    // Prevent deployment halts on minor type warnings during initial build validation
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default withNextIntl(nextConfig);
