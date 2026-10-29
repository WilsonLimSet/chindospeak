// Tone colouring, mirroring the iOS app (PinyinTone.swift):
// 1 red, 2 orange, 3 green, 4 blue, neutral grey.

const MARKED: Record<string, number> = {
  ā: 1, á: 2, ǎ: 3, à: 4,
  ē: 1, é: 2, ě: 3, è: 4,
  ī: 1, í: 2, ǐ: 3, ì: 4,
  ō: 1, ó: 2, ǒ: 3, ò: 4,
  ū: 1, ú: 2, ǔ: 3, ù: 4,
  ǖ: 1, ǘ: 2, ǚ: 3, ǜ: 4,
};

export const TONE_CLASS: Record<number, string> = {
  1: "text-[#DF321C] dark:text-[#FF5A45]",
  2: "text-[#E07B00] dark:text-[#FF9F2E]",
  3: "text-[#1E8E3E] dark:text-[#3CC463]",
  4: "text-[#1F5FD6] dark:text-[#5B9BFF]",
  5: "text-gray-400 dark:text-gray-500",
};

/** Tone (1–5) of one space-separated syllable; no mark means neutral. */
export function syllableTone(syllable: string): number {
  for (const ch of syllable.toLowerCase()) {
    if (MARKED[ch]) return MARKED[ch];
  }
  return 5;
}

const isHan = (ch: string) => /\p{Script=Han}/u.test(ch);

export function TonedPinyin({ pinyin }: { pinyin: string }) {
  const syllables = pinyin.split(/\s+/).filter(Boolean);
  return (
    <>
      {syllables.map((s, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className={TONE_CLASS[syllableTone(s)]}>{s}</span>
        </span>
      ))}
    </>
  );
}

/**
 * Colours each character by its syllable's tone — only when the number of
 * Han characters matches the syllable count, otherwise renders plain text
 * (a mismatch would paint wrong tones, which is worse than none).
 */
export function TonedHanzi({ hanzi, pinyin }: { hanzi: string; pinyin: string }) {
  const tones = pinyin.split(/\s+/).filter(Boolean).map(syllableTone);
  const chars = Array.from(hanzi);
  if (chars.filter(isHan).length !== tones.length) return <>{hanzi}</>;
  let index = 0;
  return (
    <>
      {chars.map((ch, i) =>
        isHan(ch) ? (
          <span key={i} className={TONE_CLASS[tones[index++]]}>
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  );
}
