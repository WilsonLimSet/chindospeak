import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { access, mkdir, readFile, readdir, rm, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const maxDuration = 60;

type LessonJson = {
  language?: string;
  cleanTranscript?: string;
  transcriptNotes?: string;
  translation?: string;
  summary?: string;
  speakingChallenge?: {
    prompt?: string;
    keywords?: string[];
  };
  vocab?: Array<{
    word?: string;
    pronunciation?: string;
    meaning?: string;
    example?: string;
    note?: string;
    sourcePhrase?: string;
    usefulness?: string;
    level?: string;
  }>;
  quiz?: Array<{
    question?: string;
    choices?: string[];
    answer?: string;
    explanation?: string;
  }>;
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in .env.local" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "Paste a video URL first." }, { status: 400 });
  }

  const id = randomUUID();
  const outputTemplate = path.join(os.tmpdir(), `${id}.%(ext)s`);
  const audioPath = path.join(os.tmpdir(), `${id}.mp3`);
  const frameDir = path.join(os.tmpdir(), `${id}-frames`);
  let videoPath = "";
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    videoPath = await downloadVideo(url, outputTemplate);
    await extractAudio(videoPath, audioPath);
    const subtitleText = await extractSubtitleText(openai, videoPath, frameDir).catch(() => "");

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const detectedLang =
      "language" in transcription && typeof transcription.language === "string"
        ? transcription.language
        : "unknown";
    const transcript = transcription.text?.trim() || "";

    if (!transcript) {
      throw new Error("Whisper did not find speech in this clip. Try a clearer or shorter video.");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a precise language learning assistant. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: `This is a transcript from a short video. Whisper detected the language as "${detectedLang}". Use the transcript and subtitle OCR to determine the actual language if detection is ambiguous.

Transcript:
"""
${transcript}
"""

Burned-in subtitle OCR from video frames, if available:
"""
${subtitleText || "No readable burned-in subtitles found."}
"""

Return JSON with this exact shape:
{
  "language": string,
  "cleanTranscript": "corrected transcript with obvious ASR mistakes fixed, preserving the speaker's casual style",
  "transcriptNotes": "briefly mention any uncertain correction, or empty string",
  "translation": "full English translation",
  "summary": "1-2 sentence cultural/contextual summary explaining slang, references, or subtext a learner would miss",
  "speakingChallenge": {
    "prompt": "a concrete speaking prompt asking the learner to talk about a similar situation using the target language",
    "keywords": ["3-5 words or phrases from vocab/source phrases that the learner should try to use"]
  },
  "vocab": [
    {
      "word": "the word in original script",
      "pronunciation": "learner-friendly pronunciation or romanization when useful",
      "meaning": "English meaning",
      "example": "short example sentence in original language",
      "note": "slang/register/formality note, or empty string",
      "sourcePhrase": "the exact phrase from the transcript where it appeared",
      "usefulness": "why this is worth learning from this video",
      "level": "slang" | "phrase" | "intermediate" | "basic-but-important"
    }
  ],
  "quiz": [
    {
      "question": "natural multiple-choice question testing one specific word, phrase, or sentence chunk from the transcript",
      "choices": ["choice A", "choice B", "choice C", "choice D"],
      "answer": "exact correct choice text",
      "explanation": "one sentence explaining the answer"
    }
  ]
}

Use the subtitle OCR as a correction signal when it clearly disagrees with Whisper, especially for slang, names, particles, Chinese characters, or Indonesian words that Whisper may have phonetically guessed. Do not copy OCR errors blindly; reconcile the most likely spoken transcript. Also use language plausibility: if Whisper produces a nonsensical phrase, fix it to the nearest common casual phrase instead of teaching the nonsense word. For Indonesian, phrases like "wampong lagi menang" or "lumpuh lagi menang" near a gambling/winning context are likely "mumpung lagi menang" ("since/while we're winning"). Never create a vocab card for a word unless you are confident it is real in context; if uncertain, put the uncertainty in transcriptNotes.

Pick the 5 most useful vocab items for a learner with roughly second-grade fluency in the target language: they know many everyday words, but still need help with real conversations, school/work/domain nouns, common sentence chunks, slang, idioms, and culturally specific phrasing. Do not use a rigid basic-word filter. A "basic" word can be useful if it is likely new to a low-intermediate learner, important to the clip, or part of a reusable phrase. Strongly prioritize reusable chunks, collocations, slang, idioms, discourse markers, particles, culturally specific metaphors, and concrete domain nouns. For Indonesian, examples may include "gelas kosong", "jualan ke hotel-hotel", "dari sisi spesifikasi", "harus ngerti spesifikasi", "coba kamu ... dulu", "pengiriman", and concrete nouns like "karyawan" if useful. For Chinese, prioritize useful characters/words, chengyu, discourse particles, sentence patterns, slang, and culturally loaded phrases. If the clip includes English mixed into Indonesian or Chinese, include the English/code-switched phrase only if a learner in that language community genuinely needs it to understand natural speech. If a term is uncertain because the transcript may be imperfect, include that uncertainty in "note" instead of pretending. Create exactly 5 quiz questions total, and every question must test a specific keyword, phrase, discourse marker, pronoun/register choice, or sentence chunk from the transcript. Each quiz question must test a different target word or phrase; do not ask multiple questions about the same word unless the second question tests a meaningfully different reusable chunk. Make question wording natural and grammatically correct. Do not write awkward questions like "In 'pengalaman', what does it mean?" Instead write "What does 'pengalaman' mean here?", "In 'pengalaman pertama saya', what does 'pengalaman' mean?", "What does 'gelas kosong' imply in this clip?", or "Which phrase means 'keep playing'?" Do not ask generic comprehension questions like "what is the main theme?" because learners can already infer broad meaning. Hard rule: every quiz question must be based on words or phrases that appear in cleanTranscript, subtitle OCR, or a vocab sourcePhrase. Do not introduce new words that are not in the video. Make the quiz useful before the learner reads the vocab cards, so test recall and context rather than copying definitions directly.`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message.content || "{}";
    const lesson = JSON.parse(rawContent) as LessonJson;
    const rawVocab = Array.isArray(lesson.vocab)
      ? lesson.vocab.map((item) => ({
          word: item.word || "",
          pronunciation: item.pronunciation || "",
          meaning: item.meaning || "",
          example: item.example || "",
          note: item.note || "",
          sourcePhrase: item.sourcePhrase || "",
          usefulness: item.usefulness || "",
          level: item.level || "",
        }))
      : [];
    const vocab = rawVocab.filter((item) => item.word.trim()).slice(0, 5);
    const speakingKeywords = getSpeakingKeywords(
      lesson.speakingChallenge?.keywords,
      vocab,
    );

    return NextResponse.json({
      transcript,
      subtitleText,
      detectedLang,
      language: lesson.language || detectedLang,
      cleanTranscript: lesson.cleanTranscript || transcript,
      transcriptNotes: lesson.transcriptNotes || "",
      translation: lesson.translation || "",
      summary: lesson.summary || "",
      speakingChallenge: {
        prompt:
          lesson.speakingChallenge?.prompt ||
          `In ${lesson.language || detectedLang}, respond to the situation in this video.`,
        keywords: speakingKeywords,
      },
      vocab,
      quiz: Array.isArray(lesson.quiz)
        ? lesson.quiz.slice(0, 5).map((item) => ({
            question: item.question || "",
            choices: Array.isArray(item.choices) ? item.choices.filter(Boolean) : [],
            answer: item.answer || "",
            explanation: item.explanation || "",
          }))
        : [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: humanizeError(err) },
      { status: 500 },
    );
  } finally {
    await unlink(audioPath).catch(() => undefined);
    if (videoPath) {
      await unlink(videoPath).catch(() => undefined);
    }
    await rm(frameDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function downloadVideo(url: string, outputTemplate: string) {
  const baseArgs = [
    "--no-playlist",
    "--max-filesize",
    "80m",
    "-f",
    "bv*+ba/b",
    "--merge-output-format",
    "mp4",
    "--print",
    "after_move:filepath",
    "-o",
    outputTemplate,
    url,
  ];

  try {
    return await runYtDlp(baseArgs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const shouldTryBrowserCookies =
      url.includes("instagram.com") ||
      message.includes("This content isn't available") ||
      message.includes("login") ||
      message.includes("cookies");

    if (!shouldTryBrowserCookies) {
      throw err;
    }

    return await runYtDlp(["--cookies-from-browser", "chrome", ...baseArgs]);
  }
}

async function runYtDlp(args: string[]) {
  const { stdout } = await execFileAsync("yt-dlp", args, {
    timeout: 60_000,
    maxBuffer: 1024 * 1024 * 10,
  });

  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (await fileExists(line)) {
      return line;
    }
  }

  const downloadedPath = lines[lines.length - 1];

  if (!downloadedPath) {
    throw new Error("yt-dlp did not report a downloaded video path.");
  }

  return downloadedPath;
}

async function extractAudio(videoPath: string, audioPath: string) {
  await execFileAsync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      videoPath,
      "-vn",
      "-acodec",
      "libmp3lame",
      "-q:a",
      "4",
      audioPath,
    ],
    { timeout: 45_000, maxBuffer: 1024 * 1024 * 10 },
  );
}

async function extractSubtitleText(openai: OpenAI, videoPath: string, frameDir: string) {
  await mkdir(frameDir, { recursive: true });
  const framePattern = path.join(frameDir, "subtitle-%02d.jpg");

  await execFileAsync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      videoPath,
      "-vf",
      "fps=1/2,crop=iw:ih*0.55:0:ih*0.45,scale=960:-1",
      "-frames:v",
      "16",
      "-q:v",
      "4",
      framePattern,
    ],
    { timeout: 45_000, maxBuffer: 1024 * 1024 * 10 },
  );

  const framePaths = (await readdir(frameDir))
    .filter((file) => file.endsWith(".jpg"))
    .sort()
    .slice(0, 16)
    .map((file) => path.join(frameDir, file));

  if (!framePaths.length) {
    return "";
  }

  const imageContent = await Promise.all(
    framePaths.map(async (framePath) => ({
      type: "image_url" as const,
      image_url: {
        url: `data:image/jpeg;base64,${(await readFile(framePath)).toString("base64")}`,
        detail: "low" as const,
      },
    })),
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an OCR assistant for short-form video subtitles. Respond with valid JSON only.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Read only burned-in subtitle text from these cropped video frames. Ignore UI, usernames, buttons, watermarks, reactions, and captions outside the spoken subtitle area.

Return JSON:
{
  "subtitleText": "unique subtitle lines in likely spoken order, deduplicated"
}

Preserve original script, slang, punctuation, and casual spelling. If no subtitles are readable, return an empty string.`,
          },
          ...imageContent,
        ],
      },
    ],
  });

  const rawContent = completion.choices[0]?.message.content || "{}";
  const parsed = JSON.parse(rawContent) as { subtitleText?: string };
  return parsed.subtitleText?.trim() || "";
}

function getSpeakingKeywords(
  modelKeywords: string[] | undefined,
  vocab: Array<{ word: string; sourcePhrase: string; level: string }>,
) {
  const basicWords = new Set(["bisa", "main", "menang", "kalah"]);
  const candidates = [
    ...(Array.isArray(modelKeywords) ? modelKeywords : []),
    ...vocab
      .filter((item) => ["slang", "phrase", "intermediate"].includes(item.level))
      .map((item) => item.sourcePhrase || item.word),
  ];

  return Array.from(
    new Set(
      candidates
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword && !basicWords.has(keyword.toLowerCase())),
    ),
  ).slice(0, 5);
}

function humanizeError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("ENOENT") && message.includes("yt-dlp")) {
    return "yt-dlp is not installed. Run: brew install yt-dlp ffmpeg";
  }

  if (message.includes("ENOENT") && (message.includes("ffmpeg") || message.includes("ffprobe"))) {
    return "ffmpeg is missing or unavailable. Run: brew install ffmpeg";
  }

  if (message.includes("Command failed") || message.includes("Unable to")) {
    return `Could not download this video. If this is Instagram, open the Reel in Chrome while logged in, then try again. Otherwise try a public YouTube Short backup. Details: ${message}`;
  }

  if (message.includes("timed out")) {
    return "The download took too long. Try a shorter clip for the demo.";
  }

  return message || "Processing failed.";
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
