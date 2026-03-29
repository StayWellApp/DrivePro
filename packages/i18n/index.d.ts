export const locales: readonly ["cs", "sk", "en"];
export type Locale = typeof locales[number];
export const defaultLocale: Locale;

export const messages: {
  cs: any;
  sk: any;
  en: any;
};

export function getMessages(locale: Locale): any;
