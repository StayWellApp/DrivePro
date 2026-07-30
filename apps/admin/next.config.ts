import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/database", "@repo/ui", "@repo/tailwind-config"],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    // ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default withNextIntl(nextConfig);
