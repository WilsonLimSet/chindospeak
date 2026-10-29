import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WORDS, getWord, headword, type WordEntry } from "../words";
import { TonedHanzi, TonedPinyin } from "../tones";
import { AppCta } from "../AppCta";
import { SHARE_IMAGE, SITE_URL, jsonLdHtml } from "../seo";


export const dynamicParams = false;

export function generateStaticParams() {
  return WORDS.map((w) => ({ slug: w.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function pageTitle(w: WordEntry): string {
  if (w.language === "indonesian") {
    return `${headword(w)} artinya — Indonesian slang explained | ChindoSpeak`;
  }
  const reading = w.hanzi ? `${w.hanzi}, ${w.pinyin}` : w.pinyin;
  return `${w.word} (${reading}) meaning — Chinese slang explained | ChindoSpeak`;
}

function pageDescription(w: WordEntry): string {
  const lead =
    w.language === "indonesian"
      ? `What does "${w.word}" mean in Indonesian?`
      : `What does ${w.word}${w.hanzi ? ` (${w.hanzi})` : ""} mean in Chinese?`;
  return `${lead} ${w.meaning} Usage, tone and example sentences with translations.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const w = getWord(slug);
  if (!w) return {};
  const title = pageTitle(w);
  const description = pageDescription(w);
  const url = `${SITE_URL}/words/${w.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "ChindoSpeak",
      title,
      description,
      locale: "en_US",
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}

export default async function WordPage({ params }: Props) {
  const { slug } = await params;
  const w = getWord(slug);
  if (!w) notFound();

  const isMandarin = w.language === "mandarin";
  const hanzi = w.hanzi ?? (isMandarin ? w.word : undefined);
  const related = w.related.map(getWord).filter((r): r is WordEntry => Boolean(r));

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <WordJsonLd w={w} />
      <article className="container mx-auto px-6 pt-12 pb-16 max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-10">
          <Link
            href="/words"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {isMandarin ? "Chinese" : "Indonesian"} slang dictionary
          </Link>
        </nav>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {isMandarin ? "Chinese (Mandarin) slang" : "Indonesian slang"}
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
          {w.hanzi ? (
            <>
              {w.word}{" "}
              <span className="text-3xl md:text-4xl align-middle">
                <TonedHanzi hanzi={w.hanzi} pinyin={w.pinyin ?? ""} />
              </span>
            </>
          ) : hanzi && w.pinyin ? (
            <TonedHanzi hanzi={hanzi} pinyin={w.pinyin} />
          ) : (
            headword(w)
          )}
        </h1>
        {w.pinyin && (
          <p className="mt-3 text-2xl font-medium">
            <TonedPinyin pinyin={w.pinyin} />
          </p>
        )}

        <p className="mt-8 text-xl md:text-2xl leading-snug">{w.meaning}</p>

        <dl className="mt-6 text-gray-600 dark:text-gray-400">
          <dt className="inline font-medium text-gray-900 dark:text-white">
            {isMandarin ? "Literally: " : "Origin: "}
          </dt>
          <dd className="inline">{w.literal}</dd>
        </dl>

        <section className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-3">How it's used</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{w.explanation}</p>
        </section>

        <section className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-5">Examples</h2>
          <ul className="space-y-4">
            {w.examples.map((ex) => (
              <li
                key={ex.text}
                className="rounded-xl border border-gray-200 dark:border-gray-800 p-5"
              >
                <p className="text-lg" lang={isMandarin ? "zh-Hans" : "id"}>
                  {ex.text}
                </p>
                {ex.pinyin && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{ex.pinyin}</p>
                )}
                <p className="mt-2 text-gray-600 dark:text-gray-400">{ex.translation}</p>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-5">Related words</h2>
            <ul className="flex flex-wrap gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/words/${r.slug}`}
                    className="inline-flex items-baseline gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-4 py-2 hover:border-gray-400 dark:hover:border-gray-600"
                  >
                    <span className="font-medium">{headword(r)}</span>
                    {r.pinyin && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.pinyin}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <AppCta />
      </article>
    </div>
  );
}

function WordJsonLd({ w }: { w: WordEntry }) {
  const url = `${SITE_URL}/words/${w.slug}`;
  const isMandarin = w.language === "mandarin";
  const setName = isMandarin ? "Chinese slang dictionary" : "Indonesian slang dictionary";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${url}#term`,
        name: w.hanzi ?? w.word,
        ...(isMandarin && {
          alternateName: [w.hanzi ? w.word : undefined, w.pinyin].filter(Boolean),
        }),
        description: w.meaning,
        inLanguage: isMandarin ? "zh-Hans" : "id",
        url,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          "@id": `${SITE_URL}/words#${w.language}`,
          name: `ChindoSpeak ${setName}`,
          url: `${SITE_URL}/words`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ChindoSpeak", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Slang dictionary", item: `${SITE_URL}/words` },
          { "@type": "ListItem", position: 3, name: headword(w), item: url },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
    />
  );
}
