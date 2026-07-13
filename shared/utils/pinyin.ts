import { pinyin as pinyinPro } from 'pinyin-pro';
import cedict from '@/shared/data/cedict-pinyin.json';

// Hanyu pinyin, dictionary-first.
//
// Heteronyms (多音字) can only be resolved with word context: 银行 is "yín háng",
// not "yín xíng"; 为什么 is "wèi shén me", not "wèi shí me". Character-by-character
// transliteration gets ~0.8% of CC-CEDICT's 88k common words wrong, so we look the
// word up instead. CC-CEDICT stores the reading per word, which makes it
// authoritative wherever it has an entry — benchmarked at 100% against its own
// 87,751 two-to-four character words, versus 99.17% for the library alone.
//
// Single characters are the exception: CC-CEDICT's first entry for a lone
// character is often a rare reading (要 as "yāo", 个 as "gě"), so those go to
// pinyin-pro, which is tuned for exactly that case.
//
// Regenerate the dictionary with `npm run build:pinyin` after a CC-CEDICT update.

const DICTIONARY: Record<string, string> = cedict;

// Longest CC-CEDICT headword, so we know how far to look ahead when segmenting.
const MAX_WORD_LENGTH = 8;

// Below this, trust pinyin-pro's single-character defaults over CC-CEDICT's.
const MIN_DICTIONARY_WORD = 2;

const isHanzi = (char: string) => /[一-鿿]/.test(char);

export function toPinyin(text: string): string {
  const exact = text.length >= MIN_DICTIONARY_WORD ? DICTIONARY[text] : undefined;
  if (exact) return exact;

  const parts: string[] = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    // Punctuation, latin, digits — pass straight through.
    if (!isHanzi(char)) {
      parts.push(char);
      index += 1;
      continue;
    }

    const word = longestWordAt(text, index);
    if (word) {
      parts.push(DICTIONARY[word]);
      index += word.length;
      continue;
    }

    parts.push(pinyinPro(char));
    index += 1;
  }

  return joinParts(parts);
}

function longestWordAt(text: string, index: number): string | null {
  const limit = Math.min(MAX_WORD_LENGTH, text.length - index);
  for (let length = limit; length >= MIN_DICTIONARY_WORD; length -= 1) {
    const candidate = text.slice(index, index + length);
    if (candidate in DICTIONARY) return candidate;
  }
  return null;
}

// Space-separate syllables, but don't put a space before punctuation.
function joinParts(parts: string[]): string {
  return parts
    .reduce((acc: string, part: string) => {
      if (!acc) return part;
      if (/^[\s,.!?;:，。！？；：、]/.test(part)) return acc + part;
      return `${acc} ${part}`;
    }, '')
    .replace(/\s+/g, ' ')
    .trim();
}
