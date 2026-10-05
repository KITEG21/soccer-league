import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

type LocalizedMetadataContent = {
  readonly title: string;
  readonly description: string;
};

type LocalizedMetadata = {
  readonly en: LocalizedMetadataContent;
  readonly es: LocalizedMetadataContent;
};

/** Creates localized, private metadata for authenticated application routes. */
export const createPageMetadata = async ({ en, es }: LocalizedMetadata): Promise<Metadata> => {
  const locale = await getLocale();
  const content = locale === "en" ? en : es;

  return {
    title: content.title,
    description: content.description,
    robots: { index: false, follow: false },
    openGraph: {
      title: content.title,
      description: content.description,
      type: "website",
      locale: locale === "en" ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary",
      title: content.title,
      description: content.description,
    },
  };
};
