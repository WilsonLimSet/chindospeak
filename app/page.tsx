import Link from "next/link";

const APP_STORE_URL = "https://apps.apple.com/us/app/chindospeak-mandarin-indo/id6770179868";

const FAQ_ITEMS = [
  {
    q: "What's a Chindo?",
    a: 'Chinese-Indonesian. ChindoSpeak is built for heritage speakers whose families speak Mandarin and Indonesian.',
  },
  {
    q: 'How is this different from Duolingo?',
    a: 'Duolingo teaches you a new language from scratch. ChindoSpeak helps you finish a language you already half-understand. The vocabulary, pacing, and example sentences are tuned for heritage learners.',
  },
  {
    q: 'Can it really pull vocab from any reel?',
    a: 'Yes for Instagram, TikTok, and YouTube Shorts. Heavy slang or low audio quality can produce worse results, but the pipeline is OpenAI Whisper + GPT-4o-mini.',
  },
  {
    q: 'Does it work offline?',
    a: 'Reviewing existing flashcards works offline. Importing videos, translating new text, and generating voice audio need an internet connection.',
  },
  {
    q: 'Why a subscription?',
    a: 'Each video import costs real money in transcription and translation API calls. The subscription covers those costs.',
  },
  {
    q: 'Android?',
    a: 'iOS first. Android may come later.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <StructuredData />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="container mx-auto px-6 pt-24 pb-24 max-w-2xl">
      <img
        src="/icons/icon-512x512.png"
        alt="ChindoSpeak"
        className="w-16 h-16 rounded-2xl mb-12"
      />
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-[1.1]">
        Mandarin and Indonesian, from the reels you already watch.
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        Paste a TikTok, Instagram reel, or YouTube short. ChindoSpeak transcribes it and pulls out the phrases worth learning. Spaced repetition handles the rest.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-base font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
        >
          Download on the App Store
        </a>
        <p className="text-sm text-gray-500">
          iPhone. Free to try for three days.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="container mx-auto px-6 py-16 max-w-2xl border-t border-gray-200 dark:border-gray-800">
      <div className="space-y-14">
        <FeatureBlock title="Reels in, flashcards out.">
          Whisper transcribes the audio, GPT-4o-mini cleans the transcript and picks the five most useful phrases. Around 40 seconds per video. Works on Instagram, TikTok, and YouTube Shorts.
        </FeatureBlock>

        <FeatureBlock title="Three skill tracks.">
          Reading, listening, and speaking are graded independently. Spaced repetition runs on each track separately, so you actually use a word — not just recognize it.
        </FeatureBlock>

        <FeatureBlock title="Hands-free drive mode.">
          Audio prompts and spoken answers. Apple&apos;s on-device speech recognition does the grading. The mic data never leaves your phone.
        </FeatureBlock>

        <FeatureBlock title="Built for heritage speakers.">
          The vocab, pacing, and example sentences assume you&apos;ve already heard these languages your whole life — and just need to bridge the gap from understanding to speaking.
        </FeatureBlock>
      </div>
    </section>
  );
}

function FeatureBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

function Pricing() {
  return (
    <section className="container mx-auto px-6 py-16 max-w-2xl border-t border-gray-200 dark:border-gray-800">
      <p className="text-2xl md:text-3xl font-semibold mb-6">
        $9.99 / month or $79.99 / year.
      </p>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        Three days free. Auto-renews until you cancel from your iPhone settings. Apple handles billing.
      </p>
    </section>
  );
}

function FAQ() {
  return (
    <section className="container mx-auto px-6 py-16 max-w-2xl border-t border-gray-200 dark:border-gray-800">
      <div className="space-y-1">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group border-b border-gray-200 dark:border-gray-800 last:border-b-0"
          >
            <summary className="flex items-start justify-between cursor-pointer list-none py-5 gap-6">
              <span className="font-medium">{item.q}</span>
              <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none flex-shrink-0">+</span>
            </summary>
            <p className="pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-10 max-w-2xl flex flex-col md:flex-row justify-between items-start gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <a href="mailto:wilsonlimset@gmail.com" className="hover:text-gray-900 dark:hover:text-white">wilsonlimset@gmail.com</a>
        </div>
        <nav className="flex flex-wrap gap-6">
          <Link href="/words" className="hover:text-gray-900 dark:hover:text-white">Slang dictionary</Link>
          <Link href="/support" className="hover:text-gray-900 dark:hover:text-white">Support</Link>
          <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}

// JSON-LD for search engines and AI crawlers.
function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "ChindoSpeak",
        applicationCategory: "EducationalApplication",
        operatingSystem: "iOS",
        url: "https://www.chindospeak.com",
        installUrl: APP_STORE_URL,
        description:
          "ChindoSpeak turns TikToks, Instagram reels, and YouTube shorts into Mandarin and Indonesian flashcards, then drills them with spaced repetition across reading, listening, and speaking. Built for Chinese-Indonesian heritage speakers.",
        inLanguage: ["zh", "id", "en"],
        offers: [
          {
            "@type": "Offer",
            price: "9.99",
            priceCurrency: "USD",
            category: "subscription",
            name: "ChindoSpeak Pro (monthly)",
          },
          {
            "@type": "Offer",
            price: "79.99",
            priceCurrency: "USD",
            category: "subscription",
            name: "ChindoSpeak Pro (annual)",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
