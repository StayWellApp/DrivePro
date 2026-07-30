import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/database"],
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
};

export default withNextIntl(nextConfig);
