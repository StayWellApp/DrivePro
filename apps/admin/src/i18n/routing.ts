import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["cs", "en", "sk"],
  defaultLocale: "cs",
});

export type Locale = (typeof routing.locales)[number];
