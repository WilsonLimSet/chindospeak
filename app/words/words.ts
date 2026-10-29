// Slang / modern-usage word pages. Each entry renders /words/<slug>.
// Accuracy matters more than coverage: only add words whose usage, tones and
// example sentences you'd stake the site's credibility on.

export type WordLanguage = "mandarin" | "indonesian";

export interface WordExample {
  text: string;
  /** Mandarin only. */
  pinyin?: string;
  translation: string;
}

export interface WordEntry {
  slug: string;
  language: WordLanguage;
  /** The headword as searched: hanzi for Mandarin, the Indonesian word otherwise. */
  word: string;
  /** When the headword isn't hanzi (e.g. "yyds"), the characters it stands for. */
  hanzi?: string;
  /** Mandarin only. Space-separated syllables with tone marks. */
  pinyin?: string;
  /** Mandarin: per-character gloss. Indonesian: where the word comes from. */
  literal: string;
  /** One line. Also used as the meta description lead. */
  meaning: string;
  /** 2–4 sentences on when, who, tone and register. */
  explanation: string;
  examples: [WordExample, WordExample];
  related: string[];
}

export const WORDS: WordEntry[] = [
  // ───────────────────────────── Mandarin ─────────────────────────────
  {
    slug: "nei-juan",
    language: "mandarin",
    word: "内卷",
    pinyin: "nèi juǎn",
    literal: "内 inside + 卷 to roll / curl up",
    meaning: "Involution: pointless, ever-escalating competition where everyone works harder and nobody comes out ahead.",
    explanation:
      "Borrowed from an academic term for “involution”, 内卷 exploded online around 2020 to describe school, job and workplace races where the bar keeps rising — longer hours, more certificates — without anyone getting more out of it. It's a complaint about the system, not praise for hard work. You'll hear it from students and office workers everywhere, and it's casual enough for chat but also shows up in news commentary.",
    examples: [
      {
        text: "现在找工作太内卷了，本科生都要有三段实习。",
        pinyin: "Xiànzài zhǎo gōngzuò tài nèijuǎn le, běnkēshēng dōu yào yǒu sān duàn shíxí.",
        translation: "Job hunting is so cutthroat now — even undergrads need three internships.",
      },
      {
        text: "我们公司内卷得厉害，没人敢准时下班。",
        pinyin: "Wǒmen gōngsī nèijuǎn de lìhai, méi rén gǎn zhǔnshí xiàbān.",
        translation: "The rat race at our company is intense — nobody dares to leave on time.",
      },
    ],
    related: ["juan", "tang-ping", "da-gong-ren", "nei-hao"],
  },
  {
    slug: "juan",
    language: "mandarin",
    word: "卷",
    pinyin: "juǎn",
    literal: "卷 to roll / curl up (short for 内卷)",
    meaning: "To over-compete or over-work; a try-hard who raises the bar for everyone.",
    explanation:
      "卷 is the everyday, one-character version of 内卷, used as a verb or adjective: 你好卷 (“you're such a grinder”), 别卷了 (“stop out-working everyone”). Someone who never stops is a 卷王 (juǎnwáng, “king of the grind”). It's teasing rather than hostile among friends, but it always carries a hint of “you're making the rest of us look bad”.",
    examples: [
      {
        text: "你也太卷了吧，周末还在加班。",
        pinyin: "Nǐ yě tài juǎn le ba, zhōumò hái zài jiābān.",
        translation: "You're way too much of a grinder — still working overtime on the weekend?",
      },
      {
        text: "别卷了，我们都跟不上了。",
        pinyin: "Bié juǎn le, wǒmen dōu gēn bu shàng le.",
        translation: "Stop raising the bar, the rest of us can't keep up.",
      },
    ],
    related: ["nei-juan", "tang-ping", "bai-lan"],
  },
  {
    slug: "tang-ping",
    language: "mandarin",
    word: "躺平",
    pinyin: "tǎng píng",
    literal: "躺 to lie down + 平 flat",
    meaning: "To “lie flat”: opt out of the rat race and do only the bare minimum.",
    explanation:
      "躺平 took off in 2021 as a quiet protest against 内卷 — skipping the overtime, the house and the promotion chase and accepting a low-desire life. Depending on who's speaking it can sound like a principled choice, a tired joke, or (from parents and bosses) a criticism of laziness. It's informal and very common among people in their twenties and thirties.",
    examples: [
      {
        text: "房价这么高，我干脆躺平了。",
        pinyin: "Fángjià zhème gāo, wǒ gāncuì tǎngpíng le.",
        translation: "Housing prices are this high, so I've just given up and decided to lie flat.",
      },
      {
        text: "他辞了职回老家躺平了。",
        pinyin: "Tā cí le zhí huí lǎojiā tǎngpíng le.",
        translation: "He quit his job and went back to his hometown to take it easy.",
      },
    ],
    related: ["nei-juan", "bai-lan", "fo-xi", "juan"],
  },
  {
    slug: "bai-lan",
    language: "mandarin",
    word: "摆烂",
    pinyin: "bǎi làn",
    literal: "摆 to set out / display + 烂 rotten, a mess",
    meaning: "To give up and let things get worse on purpose, because it's hopeless anyway.",
    explanation:
      "摆烂 is like 躺平 with an extra shrug: things are already going badly, so you stop trying to fix them. It's used about exams, diets, projects — even sports teams tanking a season. It's casual and self-mocking when said about yourself, and critical when said about someone else.",
    examples: [
      {
        text: "明天就考试了，我还一页没看，干脆摆烂吧。",
        pinyin: "Míngtiān jiù kǎoshì le, wǒ hái yí yè méi kàn, gāncuì bǎilàn ba.",
        translation: "The exam's tomorrow and I haven't read a single page — might as well just give up.",
      },
      {
        text: "这个项目已经没救了，老板也开始摆烂了。",
        pinyin: "Zhège xiàngmù yǐjīng méi jiù le, lǎobǎn yě kāishǐ bǎilàn le.",
        translation: "This project is beyond saving; even the boss has stopped trying.",
      },
    ],
    related: ["tang-ping", "fo-xi", "nei-juan"],
  },
  {
    slug: "da-gong-ren",
    language: "mandarin",
    word: "打工人",
    pinyin: "dǎ gōng rén",
    literal: "打 to do + 工 work + 人 person",
    meaning: "A wage worker — the self-deprecating way ordinary employees describe themselves.",
    explanation:
      "打工 used to mean doing manual or temporary work, but since 2020 office workers of every level call themselves 打工人 with a wry smile: underpaid, overworked, still showing up. It's warm, jokey solidarity — the classic greeting is 打工人，早安 (“good morning, fellow workers”). Fine with colleagues and friends; you wouldn't put it in a formal email.",
    examples: [
      {
        text: "打工人，早安！又是搬砖的一天。",
        pinyin: "Dǎgōngrén, zǎo'ān! Yòu shì bānzhuān de yì tiān.",
        translation: "Morning, fellow wage slaves! Another day of grinding away.",
      },
      {
        text: "我们打工人哪有资格挑三拣四。",
        pinyin: "Wǒmen dǎgōngrén nǎ yǒu zīgé tiāo sān jiǎn sì.",
        translation: "We working stiffs aren't in a position to be picky.",
      },
    ],
    related: ["hua-bing", "shuai-guo", "nei-juan"],
  },
  {
    slug: "hua-bing",
    language: "mandarin",
    word: "画饼",
    pinyin: "huà bǐng",
    literal: "画 to draw + 饼 flatbread / pancake",
    meaning: "To make empty promises — especially a boss dangling raises or promotions that never come.",
    explanation:
      "It comes from the idiom 画饼充饥, “drawing a pancake to satisfy hunger”. In workplace slang the boss is the one who 画饼: “stick with us, next year you'll get equity”. It's sarcastic and a little bitter, and very common in conversations among 打工人.",
    examples: [
      {
        text: "老板又在画饼了，说明年一定给我们涨工资。",
        pinyin: "Lǎobǎn yòu zài huà bǐng le, shuō míngnián yídìng gěi wǒmen zhǎng gōngzī.",
        translation: "The boss is making empty promises again, saying we'll definitely get raises next year.",
      },
      {
        text: "别给我画饼了，说点实际的。",
        pinyin: "Bié gěi wǒ huà bǐng le, shuō diǎn shíjì de.",
        translation: "Stop with the empty promises — tell me something concrete.",
      },
    ],
    related: ["da-gong-ren", "shuai-guo", "kao-pu"],
  },
  {
    slug: "shuai-guo",
    language: "mandarin",
    word: "甩锅",
    pinyin: "shuǎi guō",
    literal: "甩 to fling + 锅 wok / pot",
    meaning: "To pass the buck — shift the blame onto someone else.",
    explanation:
      "In slang the 锅 (“wok”) is the blame: you can 背锅 (carry the wok, take the blame) or 甩锅 (fling it onto someone else). It's used constantly about workplaces, politics and group projects. Informal and accusatory — saying someone 甩锅 means you think they're dodging responsibility.",
    examples: [
      {
        text: "出了问题，他第一个甩锅给实习生。",
        pinyin: "Chū le wèntí, tā dì yī ge shuǎi guō gěi shíxíshēng.",
        translation: "When something went wrong, he was the first to dump the blame on the intern.",
      },
      {
        text: "别甩锅了，这事儿就是你负责的。",
        pinyin: "Bié shuǎi guō le, zhè shìr jiù shì nǐ fùzé de.",
        translation: "Stop passing the buck — you were the one in charge of this.",
      },
    ],
    related: ["hua-bing", "da-gong-ren", "tu-cao"],
  },
  {
    slug: "kao-pu",
    language: "mandarin",
    word: "靠谱",
    pinyin: "kào pǔ",
    literal: "靠 to lean on + 谱 a score / a plan (a sense of what's proper)",
    meaning: "Reliable, dependable; a plan or person that makes sense.",
    explanation:
      "Originally northern colloquial, 靠谱 is now standard everyday Mandarin for people you can count on and ideas that are sound. The opposite is 不靠谱 (“flaky, sketchy”). It's casual but polite enough to use at work — saying a colleague is 很靠谱 is real praise.",
    examples: [
      {
        text: "小王做事很靠谱，交给他你放心。",
        pinyin: "Xiǎo Wáng zuòshì hěn kàopǔ, jiāo gěi tā nǐ fàngxīn.",
        translation: "Xiao Wang is really reliable — you can relax handing it to him.",
      },
      {
        text: "这个计划听起来不太靠谱。",
        pinyin: "Zhège jìhuà tīng qǐlái bú tài kàopǔ.",
        translation: "This plan doesn't sound very solid.",
      },
    ],
    related: ["xing-jia-bi", "hua-bing", "shuai-guo"],
  },
  {
    slug: "xing-jia-bi",
    language: "mandarin",
    word: "性价比",
    pinyin: "xìng jià bǐ",
    literal: "性(能) performance + 价(格) price + 比 ratio",
    meaning: "Value for money — what you get for what you pay.",
    explanation:
      "A shopping word everyone uses, from phone reviews to restaurant recommendations: 性价比高 means great value, 性价比低 means overpriced for what it is. It's neutral and works in any register, from chatting with friends to product descriptions. Young people even joke about the 性价比 of relationships or degrees.",
    examples: [
      {
        text: "这款手机性价比很高。",
        pinyin: "Zhè kuǎn shǒujī xìngjiàbǐ hěn gāo.",
        translation: "This phone is great value for money.",
      },
      {
        text: "这家店东西又贵又难吃，性价比太低了。",
        pinyin: "Zhè jiā diàn dōngxi yòu guì yòu nánchī, xìngjiàbǐ tài dī le.",
        translation: "This place is pricey and the food is bad — terrible value.",
      },
    ],
    related: ["kao-pu", "jue-jue-zi", "yyds"],
  },
  {
    slug: "she-kong",
    language: "mandarin",
    word: "社恐",
    pinyin: "shè kǒng",
    literal: "社(交) social + 恐(惧) fear",
    meaning: "Socially anxious; someone who dreads talking to strangers or big social situations.",
    explanation:
      "Short for 社交恐惧症 (social anxiety disorder), but online it's a light, self-descriptive label rather than a diagnosis — people say 我是社恐 the way English speakers say “I'm such an introvert”. The opposite is 社牛 (shèniú), someone with zero social fear. Casual and very common among younger people.",
    examples: [
      {
        text: "我是社恐，去一个人都不认识的聚会特别尴尬。",
        pinyin: "Wǒ shì shèkǒng, qù yí ge rén dōu bú rènshi de jùhuì tèbié gāngà.",
        translation: "I'm socially anxious — going to a party where I don't know anyone is super awkward.",
      },
      {
        text: "作为一个社恐，我连打电话点外卖都紧张。",
        pinyin: "Zuòwéi yí ge shèkǒng, wǒ lián dǎ diànhuà diǎn wàimài dōu jǐnzhāng.",
        translation: "As someone with social anxiety, even phoning in a takeout order makes me nervous.",
      },
    ],
    related: ["nei-hao", "po-fang", "fo-xi"],
  },
  {
    slug: "tu-cao",
    language: "mandarin",
    word: "吐槽",
    pinyin: "tǔ cáo",
    literal: "吐 to spit out + 槽 a trough / groove",
    meaning: "To roast, rant about, or poke fun at something.",
    explanation:
      "吐槽 entered Mandarin via Taiwan as a translation of the Japanese comedy term tsukkomi, the partner who calls out the absurdity. Today it covers everything from friendly teasing to venting about your boss; the things worth roasting are 槽点. Casual and extremely common in conversation, comments and variety shows.",
    examples: [
      {
        text: "她一下班就开始吐槽她的老板。",
        pinyin: "Tā yí xiàbān jiù kāishǐ tǔcáo tā de lǎobǎn.",
        translation: "The moment she's off work she starts ranting about her boss.",
      },
      {
        text: "这部电影槽点太多了，我得好好吐槽一下。",
        pinyin: "Zhè bù diànyǐng cáodiǎn tài duō le, wǒ děi hǎohǎo tǔcáo yíxià.",
        translation: "There's so much wrong with this movie — I've got to roast it properly.",
      },
    ],
    related: ["fan-er-sai", "shuai-guo", "po-fang"],
  },
  {
    slug: "fan-er-sai",
    language: "mandarin",
    word: "凡尔赛",
    pinyin: "fán ěr sài",
    literal: "Versailles — a sound transliteration; the characters are chosen for sound, not meaning",
    meaning: "A humblebrag: showing off while pretending to complain or be modest.",
    explanation:
      "Named after the Palace of Versailles and its aristocratic luxury, 凡尔赛 (or 凡尔赛文学, “Versailles literature”) went viral in 2020 for posts like “ugh, my boyfriend bought me another car I didn't want”. Calling someone 凡尔赛 is teasing — you've spotted the brag. It's used as an adjective or verb: 别凡尔赛了 (“quit humblebragging”).",
    examples: [
      {
        text: "她说“好烦啊，男朋友又送我一个包”，太凡尔赛了。",
        pinyin: "Tā shuō “hǎo fán a, nánpéngyou yòu sòng wǒ yí ge bāo”, tài fán'ěrsài le.",
        translation: "She said “Ugh, so annoying, my boyfriend gave me another handbag” — such a humblebrag.",
      },
      {
        text: "别凡尔赛了，考了满分还说自己没复习。",
        pinyin: "Bié fán'ěrsài le, kǎo le mǎnfēn hái shuō zìjǐ méi fùxí.",
        translation: "Quit humblebragging — you got full marks and you're still saying you didn't study.",
      },
    ],
    related: ["tu-cao", "jue-jue-zi", "yyds"],
  },
  {
    slug: "fo-xi",
    language: "mandarin",
    word: "佛系",
    pinyin: "fó xì",
    literal: "佛 Buddha + 系 type / style",
    meaning: "Buddha-like: chill, low-desire, go-with-the-flow.",
    explanation:
      "Borrowed from Japanese around 2017, 佛系 describes an attitude of not fighting for things — whatever happens, happens (随缘). It's attached to almost anything: 佛系青年 (zen youth), 佛系养生, 佛系追星. Usually playful and self-describing; it's gentler and less political than 躺平.",
    examples: [
      {
        text: "我对减肥很佛系，瘦不瘦随缘。",
        pinyin: "Wǒ duì jiǎnféi hěn fóxì, shòu bú shòu suíyuán.",
        translation: "I'm very zen about dieting — whether I lose weight or not, whatever happens happens.",
      },
      {
        text: "他是个佛系的人，从来不跟别人争。",
        pinyin: "Tā shì ge fóxì de rén, cónglái bù gēn biérén zhēng.",
        translation: "He's a laid-back guy who never competes with anyone.",
      },
    ],
    related: ["tang-ping", "bai-lan", "nei-hao"],
  },
  {
    slug: "nei-hao",
    language: "mandarin",
    word: "内耗",
    pinyin: "nèi hào",
    literal: "内 inside + 耗 to consume / drain",
    meaning: "Draining yourself from the inside — overthinking, self-doubt and second-guessing.",
    explanation:
      "内耗 originally meant internal friction inside an organisation, and it still does in business news. Online it now usually means 精神内耗 (mental self-drain): replaying conversations, worrying, and exhausting yourself before doing anything. People say 别内耗了 to tell a friend to stop overthinking. Casual but sincere.",
    examples: [
      {
        text: "别再内耗了，想做就去做。",
        pinyin: "Bié zài nèihào le, xiǎng zuò jiù qù zuò.",
        translation: "Stop wearing yourself out overthinking — if you want to do it, just do it.",
      },
      {
        text: "我每天晚上都在精神内耗，一直想白天说错的话。",
        pinyin: "Wǒ měitiān wǎnshang dōu zài jīngshén nèihào, yìzhí xiǎng báitiān shuō cuò de huà.",
        translation: "Every night I drain myself mentally, replaying the things I said wrong that day.",
      },
    ],
    related: ["she-kong", "po-fang", "nei-juan"],
  },
  {
    slug: "po-fang",
    language: "mandarin",
    word: "破防",
    pinyin: "pò fáng",
    literal: "破 to break + 防 defence",
    meaning: "To have your emotional guard broken — suddenly moved, hurt or upset.",
    explanation:
      "破防 comes from gaming, where it means breaking through an opponent's defence. Now it's what happens when something gets to you: a touching video, a parent's message, or a comment that stings. It works for being moved to tears and for being genuinely upset, so context tells you which. Casual and very common online.",
    examples: [
      {
        text: "看到妈妈发的那条消息，我直接破防了。",
        pinyin: "Kàndào māma fā de nà tiáo xiāoxi, wǒ zhíjiē pòfáng le.",
        translation: "When I saw that message from Mom, I completely lost it.",
      },
      {
        text: "他说我胖，我当场就破防了。",
        pinyin: "Tā shuō wǒ pàng, wǒ dāngchǎng jiù pòfáng le.",
        translation: "He called me fat, and I was crushed on the spot.",
      },
    ],
    related: ["nei-hao", "she-kong", "tu-cao"],
  },
  {
    slug: "jue-jue-zi",
    language: "mandarin",
    word: "绝绝子",
    pinyin: "jué jué zǐ",
    literal: "绝 peerless / extreme, doubled + 子 a cute suffix",
    meaning: "Absolutely amazing — over-the-top internet praise.",
    explanation:
      "绝绝子 spread from Weibo and Xiaohongshu around 2021 as gushing praise for food, outfits, makeup or idols. It sounds very online and a bit performative, so plenty of people use it ironically or find it cringey; it can even be sarcastic (“this service is 绝绝子” about bad service). Strictly casual.",
    examples: [
      {
        text: "这家的奶茶绝绝子，一定要试试！",
        pinyin: "Zhè jiā de nǎichá juéjuézǐ, yídìng yào shìshi!",
        translation: "The milk tea here is absolutely amazing — you have to try it!",
      },
      {
        text: "今天这身穿搭绝绝子！",
        pinyin: "Jīntiān zhè shēn chuāndā juéjuézǐ!",
        translation: "Today's outfit is just perfect!",
      },
    ],
    related: ["yyds", "666", "fan-er-sai"],
  },
  {
    slug: "yyds",
    language: "mandarin",
    word: "yyds",
    hanzi: "永远的神",
    pinyin: "yǒng yuǎn de shén",
    literal: "y(ǒng) y(uǎn) d(e) s(hén) — 永远 forever + 的 (possessive) + 神 god",
    meaning: "“Forever a god” — the GOAT, the absolute best.",
    explanation:
      "yyds is the pinyin initials of 永远的神. It started in esports fandom and became general praise for anything: a singer, a dish, a phone. People type it more than say it, and when spoken it's usually just the letters or the full 永远的神. Very casual and very online.",
    examples: [
      {
        text: "周杰伦yyds！",
        pinyin: "Zhōu Jiélún yyds!",
        translation: "Jay Chou is the GOAT!",
      },
      {
        text: "这家火锅真的yyds，我每周都来。",
        pinyin: "Zhè jiā huǒguō zhēn de yyds, wǒ měi zhōu dōu lái.",
        translation: "This hotpot place is truly the best — I come every week.",
      },
    ],
    related: ["jue-jue-zi", "666", "xing-jia-bi"],
  },
  {
    slug: "666",
    language: "mandarin",
    word: "666",
    pinyin: "liù liù liù",
    literal: "Six six six — 6 (liù) sounds like 溜 (liù), “slick, skilful”",
    meaning: "Awesome, nice one, well played.",
    explanation:
      "666 started in gaming chats to cheer a slick play and is now used for anything impressive — in comments, bullet chats (弹幕) and out loud as liù liù liù. It has nothing to do with the devil in Chinese. It can also be sarcastic (“you broke it again? 666”), so tone matters. Casual only.",
    examples: [
      {
        text: "这波操作666！",
        pinyin: "Zhè bō cāozuò liù liù liù!",
        translation: "That play was sick!",
      },
      {
        text: "你一个人搞定了整个项目？666啊。",
        pinyin: "Nǐ yí ge rén gǎodìng le zhěnggè xiàngmù? Liù liù liù a.",
        translation: "You handled the whole project by yourself? Respect.",
      },
    ],
    related: ["yyds", "jue-jue-zi", "tu-cao"],
  },

  // ──────────────────────────── Indonesian ────────────────────────────
  {
    slug: "gabut",
    language: "indonesian",
    word: "gabut",
    literal: "Often traced to gaji buta (“blind salary”, being paid without working)",
    meaning: "Bored with nothing to do; idle.",
    explanation:
      "Gabut is what you are when there's nothing to do and you don't know what to do with yourself — between tasks at work, on a slow afternoon, or during a long holiday. It's very common among young Indonesians in chat and on social media. Casual; you wouldn't use it in a formal setting.",
    examples: [
      {
        text: "Lagi gabut nih, ada yang mau nongkrong?",
        translation: "I'm so bored with nothing to do — anyone want to hang out?",
      },
      {
        text: "Kerjaan udah beres semua, sekarang gabut banget di kantor.",
        translation: "All my work is done, so now I'm just sitting around bored at the office.",
      },
    ],
    related: ["mager", "santuy", "healing"],
  },
  {
    slug: "mager",
    language: "indonesian",
    word: "mager",
    literal: "Short for malas gerak (“lazy to move”)",
    meaning: "Too lazy to move; can't be bothered to get up or go out.",
    explanation:
      "Mager is the feeling of not wanting to leave the bed, the couch or the house. It's used as an adjective (gue mager banget) and is one of the most common slang words in everyday chat. Casual and harmless — it's a mood, not an insult.",
    examples: [
      {
        text: "Hujan gini bikin mager keluar rumah.",
        translation: "Rain like this makes me too lazy to leave the house.",
      },
      {
        text: "Gue mager banget, pesen online aja yuk.",
        translation: "I really can't be bothered to move — let's just order online.",
      },
    ],
    related: ["gabut", "santuy", "healing"],
  },
  {
    slug: "baper",
    language: "indonesian",
    word: "baper",
    literal: "Short for bawa perasaan (“bring feelings”)",
    meaning: "Taking things too personally or emotionally; catching feelings.",
    explanation:
      "Someone who is baper reads too much into a joke, a comment or a kind gesture. It's used both for getting hurt too easily (jangan baper, cuma bercanda) and for developing a crush because someone was nice to you. Casual and very common; usually teasing.",
    examples: [
      {
        text: "Jangan baper dong, aku cuma bercanda.",
        translation: "Don't take it so personally, I was only joking.",
      },
      {
        text: "Dia emang baik ke semua orang, jangan baper duluan.",
        translation: "He's nice to everyone — don't go catching feelings yet.",
      },
    ],
    related: ["bucin", "salty", "julid"],
  },
  {
    slug: "santuy",
    language: "indonesian",
    word: "santuy",
    literal: "A playful twist on santai (“relaxed”)",
    meaning: "Relaxed, chill, no stress.",
    explanation:
      "Santuy is santai said with a wink. People use it to calm someone down (santuy aja, “relax”), or to describe a chill person or plan. It's light, friendly and casual — fine with friends, a bit too playful for work emails.",
    examples: [
      {
        text: "Santuy aja, deadline-nya masih minggu depan.",
        translation: "Relax, the deadline isn't until next week.",
      },
      {
        text: "Weekend ini aku mau santuy di rumah aja.",
        translation: "This weekend I just want to chill at home.",
      },
    ],
    related: ["mager", "gabut", "healing"],
  },
  {
    slug: "julid",
    language: "indonesian",
    word: "julid",
    literal: "Slang adjective; no common expansion",
    meaning: "Snarky, envious and gossipy about other people.",
    explanation:
      "Julid describes someone who can't stand to see others doing well and comments on it — sneering in group chats or leaving nasty comments online. You'll see netizen julid everywhere on Indonesian social media. It's a criticism, though friends also use it jokingly about their own gossiping.",
    examples: [
      {
        text: "Netizen julid banget sama postingan artis itu.",
        translation: "Netizens are being so nasty about that celebrity's post.",
      },
      {
        text: "Udah deh, jangan julid sama urusan orang.",
        translation: "Come on, stop sniping about other people's business.",
      },
    ],
    related: ["kepo", "salty", "baper"],
  },
  {
    slug: "anjay",
    language: "indonesian",
    word: "anjay",
    literal: "A softened form of anjing (“dog”), used as an exclamation",
    meaning: "Whoa! / Damn! — an exclamation of surprise or amazement.",
    explanation:
      "Anjay is what you blurt out when something is impressive or shocking. Because it's a softened swear word, it's much milder than anjing, but it's still crude: fine among friends, not with parents, teachers or at work. It's usually positive (anjay, keren!) rather than an insult.",
    examples: [
      {
        text: "Anjay, mobil barunya keren banget!",
        translation: "Damn, his new car is so cool!",
      },
      {
        text: "Anjay, nilai ujianmu seratus?",
        translation: "Whoa, you got a hundred on the exam?",
      },
    ],
    related: ["gercep", "gaje", "salty"],
  },
  {
    slug: "gercep",
    language: "indonesian",
    word: "gercep",
    literal: "Short for gerak cepat (“move fast”)",
    meaning: "Quick to act; fast off the mark.",
    explanation:
      "Gercep is praise for someone who acts right away — replying instantly, grabbing the deal, getting things done. It's also an urging: harus gercep (“you've got to move fast”). Casual but positive; it pops up in chats, online shopping promos and even at work among colleagues.",
    examples: [
      {
        text: "Tiketnya cepet habis, harus gercep!",
        translation: "Tickets sell out fast — you've got to move quick!",
      },
      {
        text: "Wah, gercep banget kamu, langsung dibales.",
        translation: "Wow, you're fast — you replied right away.",
      },
    ],
    related: ["mager", "anjay", "kepo"],
  },
  {
    slug: "bucin",
    language: "indonesian",
    word: "bucin",
    literal: "Short for budak cinta (“slave of love”)",
    meaning: "Head over heels; someone who'd do anything for their partner.",
    explanation:
      "A bucin drops everything for their boyfriend or girlfriend — skipping plans, replying in seconds, posting couple photos nonstop. Friends use it to tease, and people cheerfully call themselves bucin too. Casual; close to “whipped” or “simp” in English, but usually affectionate.",
    examples: [
      {
        text: "Sejak punya pacar, dia jadi bucin banget.",
        translation: "Ever since he got a girlfriend, he's been totally whipped.",
      },
      {
        text: "Dasar bucin, diajak main malah milih nemenin pacar.",
        translation: "Such a lovesick fool — we invited him out and he chose to hang out with his girlfriend.",
      },
    ],
    related: ["baper", "kepo", "salty"],
  },
  {
    slug: "kepo",
    language: "indonesian",
    word: "kepo",
    literal: "Usually traced to Hokkien 家婆 (kay-poh, “busybody”)",
    meaning: "Nosy; curious about other people's business.",
    explanation:
      "Kepo describes someone who always wants to know what's going on with others — who's dating whom, how much you earn. The same Hokkien word gives Singapore and Malaysia's kaypoh. It can be a mild put-down (kepo banget sih!) or a cheerful admission of your own curiosity (aku kepo). Casual.",
    examples: [
      {
        text: "Kepo banget sih, mau tahu aja urusan orang.",
        translation: "You're so nosy — always wanting to know other people's business.",
      },
      {
        text: "Aku kepo, sebenarnya mereka pacaran nggak sih?",
        translation: "I'm curious — are they actually dating or not?",
      },
    ],
    related: ["julid", "baper", "bucin"],
  },
  {
    slug: "gaje",
    language: "indonesian",
    word: "gaje",
    literal: "Short for gak jelas (“not clear”)",
    meaning: "Random, pointless, weird — doesn't make sense.",
    explanation:
      "Gaje is for things or people that are all over the place: a random video, a rambling chat, a friend acting silly for no reason. It can be fondly teasing or mildly dismissive. Casual.",
    examples: [
      {
        text: "Videonya gaje banget, tapi lucu.",
        translation: "The video is so random, but it's funny.",
      },
      {
        text: "Jangan ngomong gaje deh, langsung ke intinya aja.",
        translation: "Stop rambling — just get to the point.",
      },
    ],
    related: ["anjay", "gabut", "santuy"],
  },
  {
    slug: "salty",
    language: "indonesian",
    word: "salty",
    literal: "Borrowed from English salty",
    meaning: "Bitter, sour or petty — annoyed because you lost or feel left out.",
    explanation:
      "Indonesian speakers use the English word salty much like English gamers do: for someone sulking after losing, or resentful about someone else's luck. It's common in gaming, sports and social-media banter. Casual and teasing.",
    examples: [
      {
        text: "Kalah main game sekali aja langsung salty.",
        translation: "He loses one game and he's instantly salty.",
      },
      {
        text: "Dia masih salty gara-gara nggak diajak liburan.",
        translation: "She's still salty about not being invited on the trip.",
      },
    ],
    related: ["julid", "baper", "anjay"],
  },
  {
    slug: "healing",
    language: "indonesian",
    word: "healing",
    literal: "Borrowed from English healing",
    meaning: "Taking a break or a trip to de-stress — “me time” after a hard stretch.",
    explanation:
      "In Indonesian, healing rarely means medical recovery. It means getting away from work or study stress: a trip to Bali, a staycation, or just a coffee. It's often used jokingly, since almost any outing can be called healing. Casual and very common on social media.",
    examples: [
      {
        text: "Capek kerja terus, weekend ini mau healing ke Bali.",
        translation: "I'm worn out from work — this weekend I'm off to Bali to unwind.",
      },
      {
        text: "Healing-nya cuma ke kafe sebelah, tapi lumayan lah.",
        translation: "My “healing” was just the café next door, but it's better than nothing.",
      },
    ],
    related: ["santuy", "mager", "gabut"],
  },
];

export const WORDS_BY_SLUG: ReadonlyMap<string, WordEntry> = new Map(
  WORDS.map((w) => [w.slug, w]),
);

export function getWord(slug: string): WordEntry | undefined {
  return WORDS_BY_SLUG.get(slug);
}

/** Display label used in titles and headings, e.g. "内卷" or "Gabut". */
export function headword(entry: WordEntry): string {
  return entry.language === "indonesian"
    ? entry.word.charAt(0).toUpperCase() + entry.word.slice(1)
    : entry.word;
}
