import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WORDS, headword, type WordEntry, type WordLanguage } from "./words";
import { TonedPinyin } from "./tones";
import { AppCta } from "./AppCta";
import { SHARE_IMAGE, SITE_URL, jsonLdHtml } from "./seo";

const TITLE = "Chinese & Indonesian slang dictionary for heritage speakers";
const DESCRIPTION =
  "Plain-English meanings of modern Chinese and Indonesian slang — 内卷, 躺平, yyds, gabut, mager, baper and more — with pinyin, usage notes and example sentences.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ChindoSpeak` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/words` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/words`,
    siteName: "ChindoSpeak",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
};

const GROUPS: { language: WordLanguage; heading: string; blurb: string }[] = [
  {
    language: "mandarin",
    heading: "Chinese (Mandarin) slang",
    blurb: "Internet and workplace words you'll hear from friends and coworkers in China.",
  },
  {
    language: "indonesian",
    heading: "Indonesian slang",
    blurb: "Bahasa gaul that fills every group chat and comment section.",
  },
];

export default function WordsIndexPage() {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <IndexJsonLd />
      <div className="container mx-auto px-6 pt-12 pb-16 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ChindoSpeak
        </Link>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-[1.1]">
          {TITLE}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Grew up hearing Mandarin or Indonesian at home but lost track of how people talk now?
          These are the modern, slang and workplace words heritage speakers most often miss —
          what they mean, who says them, and how they sound in a real sentence.
        </p>

        {GROUPS.map((g) => {
          const words = WORDS.filter((w) => w.language === g.language);
          return (
            <section
              key={g.language}
              className="mt-14 pt-10 border-t border-gray-200 dark:border-gray-800"
            >
              <h2 className="text-2xl font-semibold mb-2">{g.heading}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{g.blurb}</p>
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {words.map((w) => (
                  <WordRow key={w.slug} w={w} />
                ))}
              </ul>
            </section>
          );
        })}

        <AppCta />
      </div>
    </div>
  );
}

function WordRow({ w }: { w: WordEntry }) {
  return (
    <li>
      <Link href={`/words/${w.slug}`} className="group block py-4">
        <span className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-lg font-semibold group-hover:underline">{headword(w)}</span>
          {w.hanzi && <span className="text-gray-500 dark:text-gray-400">{w.hanzi}</span>}
          {w.pinyin && (
            <span className="text-sm">
              <TonedPinyin pinyin={w.pinyin} />
            </span>
          )}
        </span>
        <span className="mt-1 block text-gray-600 dark:text-gray-400 leading-relaxed">
          {w.meaning}
        </span>
      </Link>
    </li>
  );
}

function IndexJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": GROUPS.map((g) => ({
      "@type": "DefinedTermSet",
      "@id": `${SITE_URL}/words#${g.language}`,
      name: `ChindoSpeak ${g.language === "mandarin" ? "Chinese" : "Indonesian"} slang dictionary`,
      url: `${SITE_URL}/words`,
      inLanguage: g.language === "mandarin" ? "zh-Hans" : "id",
      hasDefinedTerm: WORDS.filter((w) => w.language === g.language).map((w) => ({
        "@type": "DefinedTerm",
        "@id": `${SITE_URL}/words/${w.slug}#term`,
        name: w.hanzi ?? w.word,
        description: w.meaning,
        url: `${SITE_URL}/words/${w.slug}`,
      })),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
    />
  );
}
