// Builds shared/data/cedict-pinyin.json from CC-CEDICT.
//
//   npm run build:pinyin
//
// CC-CEDICT (CC-BY-SA 4.0, https://cc-cedict.org) stores the reading per *word*,
// which is what makes heteronyms resolvable: 银行 is "yín háng" only because the
// dictionary knows 银行 as a word. We convert its numbered pinyin (yin2 hang2) to
// tone marks and write a flat word -> pinyin map.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pinyin as pinyinPro } from 'pinyin-pro';

const SOURCE = 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz';
const OUTPUT = path.join(process.cwd(), 'shared/data/cedict-pinyin.json');

const VOWELS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', 'ü': 'ǖǘǚǜ' };

/** "hang2" -> "háng". Tone goes on a > e/o > last vowel, per pinyin orthography. */
function numberedToToneMarks(syllable) {
  const match = syllable.match(/^([a-zü:]+)([1-5])$/i);
  if (!match) return null;

  const base = match[1].toLowerCase().replace(/u:/g, 'ü');
  const tone = Number(match[2]);
  if (tone === 5) return base; // neutral

  const target = base.includes('a') ? 'a'
    : base.includes('e') ? 'e'
    : base.includes('ou') ? 'o'
    : (base.match(/[aeiouü]/g) ?? []).at(-1);
  if (!target) return base;

  const at = base.lastIndexOf(target);
  return base.slice(0, at) + VOWELS[target][tone - 1] + base.slice(at + 1);
}

/** Tone marks and erhua spelling differ by convention; compare the bare reading. */
const bareReading = (value) =>
  value.normalize('NFD').replace(/[̀-̏]/g, '').replace(/\ber\b/g, 'r').replace(/\s+/g, ' ').trim();

async function fetchCedict() {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`CC-CEDICT download failed: HTTP ${response.status}`);
  const gz = Buffer.from(await response.arrayBuffer());
  return zlib.gunzipSync(gz).toString('utf8');
}

function parse(raw) {
  const readings = new Map();

  for (const line of raw.split('\n')) {
    const match = line.trim().match(/^(\S+) (\S+) \[([^\]]+)\] \/(.*)\/$/);
    if (!match) continue;

    const [, , simplified, numbered] = match;
    // Two characters and up only. Lone characters are looked up in pinyin-pro, whose
    // single-character defaults are frequency-tuned, whereas CC-CEDICT's first entry
    // is often a rare reading (要 as "yāo", 个 as "gě"). Shipping them would be dead
    // weight — see MIN_DICTIONARY_WORD in shared/utils/pinyin.ts.
    if (!/^[一-鿿]{2,8}$/.test(simplified)) continue;

    const syllables = numbered.split(/\s+/).map(numberedToToneMarks);
    if (syllables.some((s) => s === null)) continue;

    // CC-CEDICT lists erhua as its own "r" syllable; attach it to the one before.
    const merged = [];
    for (const syllable of syllables) {
      if (syllable === 'r' && merged.length) merged[merged.length - 1] += 'r';
      else merged.push(syllable);
    }

    if (!readings.has(simplified)) readings.set(simplified, []);
    const list = readings.get(simplified);
    const reading = merged.join(' ');
    if (!list.includes(reading)) list.push(reading);
  }

  return readings;
}

function resolve(readings) {
  const dictionary = {};
  let ambiguous = 0;

  for (const [word, list] of readings) {
    if (list.length === 1) {
      dictionary[word] = list[0];
      continue;
    }

    // Several valid readings (便宜 is "pián yi" = cheap, or "biàn yí" = convenient).
    // CC-CEDICT's file order is not frequency order, so prefer whichever reading
    // pinyin-pro also picks — it is frequency-tuned — and only fall back to the
    // first entry when it agrees with none of them.
    const guess = pinyinPro(word);
    const agreed = list.find((reading) => bareReading(reading) === bareReading(guess));
    dictionary[word] = agreed ?? list[0];
    if (agreed) ambiguous += 1;
  }

  return { dictionary, ambiguous };
}

const raw = await fetchCedict();
const readings = parse(raw);
const { dictionary, ambiguous } = resolve(readings);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(dictionary));

console.log(`entries: ${Object.keys(dictionary).length}`);
console.log(`multi-reading words resolved via pinyin-pro: ${ambiguous}`);
console.log(`written: ${path.relative(process.cwd(), OUTPUT)}`);
