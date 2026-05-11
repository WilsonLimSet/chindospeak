"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft, BookOpen, Check, Clapperboard, Loader2, Save, Sparkles } from "lucide-react";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { Category, Flashcard } from "@/shared/types";

type VocabItem = {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  note?: string;
  sourcePhrase?: string;
  usefulness?: string;
  level?: string;
};

type QuizItem = {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
};

type VideoLesson = {
  transcript: string;
  subtitleText?: string;
  cleanTranscript: string;
  transcriptNotes: string;
  detectedLang: string;
  language: string;
  translation: string;
  summary: string;
  speakingChallenge?: {
    prompt: string;
    keywords: string[];
  };
  vocab: VocabItem[];
  quiz: QuizItem[];
};

const IMPORT_CATEGORY = "Video Imports";

export default function VideoPage() {
  const { config } = useLanguage();
  const storage = useMemo(() => new UnifiedLocalStorage(`${config.code}-flashcards`), [config.code]);
  const [url, setUrl] = useState("");
  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const newCards = lesson?.vocab.filter((item) => !known.has(cardKey(item))) ?? [];

  async function analyzeVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSavedMessage("");
    setLesson(null);
    setKnown(new Set());

    try {
      const response = await fetch("/api/video/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not analyze this video.");
      }

      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function saveToDeck() {
    if (!lesson || newCards.length === 0) return;

    const category = getOrCreateImportCategory(storage);
    const existing = storage.getFlashcards();
    const existingKeys = new Set(existing.map((card) => normalizedCardKey(card.word, card.translation)));
    const today = new Date().toISOString().split("T")[0];

    const cardsToAdd: Flashcard[] = newCards
      .filter((item) => !existingKeys.has(normalizedCardKey(item.word, item.meaning)))
      .map((item) => ({
        id: uuidv4(),
        word: item.word,
        pronunciation: item.pronunciation || undefined,
        translation: item.meaning,
        categoryId: category.id,
        difficulty: item.level === "slang" || item.level === "phrase" ? 2 : 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewHistory: [],
        readingReviewLevel: 0,
        readingNextReviewDate: today,
        readingDifficulty: 1,
        listeningReviewLevel: 0,
        listeningNextReviewDate: today,
        listeningDifficulty: 1,
        speakingReviewLevel: 0,
        speakingNextReviewDate: today,
        speakingDifficulty: 1,
      }));

    storage.saveFlashcards([...existing, ...cardsToAdd]);
    setSavedMessage(
      cardsToAdd.length
        ? `Saved ${cardsToAdd.length} cards to ${config.name} review.`
        : "Those cards are already in your deck.",
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ChindoSpeak
        </Link>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-5 flex items-start gap-3">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: config.theme.primary }}
            >
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Learn from video
              </p>
              <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                Turn a short clip into ChindoSpeak cards
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Paste a Reel, TikTok, or Short. ChindoSpeak will transcribe it, clean up subtitles, pull out useful phrases, and save the words you actually want to review.
              </p>
            </div>
          </div>

          <form onSubmit={analyzeVideo} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className="min-h-12 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              style={{ boxShadow: "none" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: config.theme.primary }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing" : "Analyze"}
            </button>
          </form>

          {loading ? (
            <p className="mt-4 rounded-xl bg-gray-100 p-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              Downloading the clip, reading on-screen subtitles, transcribing audio, and building cards. This usually takes 30-60 seconds.
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          ) : null}
        </section>

        {lesson ? (
          <section className="mt-5 space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Detected language</p>
                  <h2 className="text-xl font-bold text-gray-950 dark:text-white">{lesson.language || lesson.detectedLang}</h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{lesson.summary}</p>
                </div>
                <div className="rounded-xl bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                  <p><strong>{newCards.length}</strong> new</p>
                  <p><strong>{lesson.vocab.length - newCards.length}</strong> marked known</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={saveToDeck}
                  disabled={newCards.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: config.theme.primary }}
                >
                  <Save className="h-4 w-4" />
                  Save {newCards.length} to {config.name}
                </button>
                <Link
                  href="/review"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  Review deck
                </Link>
              </div>

              {savedMessage ? (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {savedMessage}
                </p>
              ) : null}
            </div>

            <Panel title="Phrase drill">
              <div className="space-y-3">
                {lesson.quiz.slice(0, 5).map((item, index) => (
                  <details key={`${item.question}-${index}`} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {item.question}
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {item.choices.map((choice) => (
                        <p key={choice} className={choice === item.answer ? "font-semibold text-emerald-700 dark:text-emerald-300" : ""}>
                          {choice === item.answer ? "✓ " : ""}{choice}
                        </p>
                      ))}
                      <p>{item.explanation}</p>
                    </div>
                  </details>
                ))}
              </div>
            </Panel>

            {lesson.speakingChallenge ? (
              <Panel title="Speaking prompt">
                <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{lesson.speakingChallenge.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lesson.speakingChallenge.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </Panel>
            ) : null}

            <Panel title="Cards">
              <div className="grid gap-3">
                {lesson.vocab.map((item, index) => {
                  const isKnown = known.has(cardKey(item));
                  return (
                    <article
                      key={`${item.word}-${index}`}
                      className={`rounded-xl border p-4 transition ${
                        isKnown
                          ? "border-gray-200 bg-gray-50 opacity-70 dark:border-gray-700 dark:bg-gray-900"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h3 className="text-xl font-bold text-gray-950 dark:text-white">{item.word}</h3>
                            {item.pronunciation ? (
                              <span className="text-sm text-gray-500 dark:text-gray-400">{item.pronunciation}</span>
                            ) : null}
                            {item.level ? (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                                {item.level}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">{item.meaning}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSavedMessage("");
                            setKnown((current) => {
                              const next = new Set(current);
                              const key = cardKey(item);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            });
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            isKnown
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {isKnown ? <Check className="h-3 w-3" /> : null}
                          {isKnown ? "Known" : "New"}
                        </button>
                      </div>
                      {item.sourcePhrase ? (
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">From video: {item.sourcePhrase}</p>
                      ) : null}
                      {item.example ? (
                        <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">{item.example}</p>
                      ) : null}
                      {item.note || item.usefulness ? (
                        <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {[item.note, item.usefulness].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Transcript">
              <p className="text-base leading-7 text-gray-900 dark:text-white">{lesson.cleanTranscript || lesson.transcript}</p>
              {lesson.transcriptNotes ? (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-100">
                  {lesson.transcriptNotes}
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{lesson.translation}</p>
            </Panel>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h2>
      {children}
    </section>
  );
}

function getOrCreateImportCategory(storage: UnifiedLocalStorage): Category {
  const categories = storage.getCategories();
  const existing = categories.find((category) => category.name === IMPORT_CATEGORY);
  if (existing) return existing;

  const category: Category = {
    id: uuidv4(),
    name: IMPORT_CATEGORY,
    color: "#7C3AED",
    createdAt: new Date(),
  };
  storage.saveCategories([...categories, category]);
  return category;
}

function cardKey(item: VocabItem) {
  return normalizedCardKey(item.word, item.meaning);
}

function normalizedCardKey(word: string, meaning: string) {
  return `${word.trim().toLowerCase()}::${meaning.trim().toLowerCase()}`;
}
