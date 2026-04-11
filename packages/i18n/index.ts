import cs from "./messages/cs.json";
import sk from "./messages/sk.json";
import en from "./messages/en.json";

export const locales = ["cs", "sk", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "cs";

export const messages = {
  cs,
  sk,
  en,
};

export function getMessages(locale: Locale) {
  return messages[locale];
}
