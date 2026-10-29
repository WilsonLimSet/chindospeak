import { APP_STORE_URL } from "./seo";

export function AppCta() {
  return (
    <aside className="mt-14 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8">
      <div className="flex items-start gap-4">
        {/* Plain <img>: a 48px static icon doesn't need (billed) image optimisation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192x192.png"
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-xl flex-shrink-0"
        />
        <div>
          <p className="text-lg font-semibold leading-snug">
            Learn words like this with spaced repetition.
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
            ChindoSpeak is a flashcard app for heritage speakers who understand Mandarin or
            Indonesian but are missing the modern, slang and workplace words.
          </p>
        </div>
      </div>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-base font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
      >
        ChindoSpeak on the App Store
      </a>
    </aside>
  );
}
