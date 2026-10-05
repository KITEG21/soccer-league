export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";
export const localeCookieName = "locale";

export const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value && locales.includes(value as Locale));
