// Browser speech helpers + answer parsing. Only call these from event handlers or useEffect
// (never during render), so Next.js server rendering doesn't crash.
import { SPEECH_LANG } from "./data";

export function speak(text, lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SPEECH_LANG[lang] || "en-US";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export function speechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Starts listening once. Calls onResult(transcript) or onError(message).
// Returns a stop() function.
export function listenOnce(lang, onResult, onError, onEnd) {
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) {
    if (onError) onError("unsupported");
    return () => {};
  }
  const rec = new SR();
  rec.lang = SPEECH_LANG[lang] || "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => onResult(e.results[0][0].transcript);
  rec.onerror = (e) => onError && onError(e.error);
  rec.onend = () => onEnd && onEnd();
  rec.start();
  return () => rec.stop();
}

// ---------- Turning what a student typed or said into an answer ----------

const DIGIT_WORDS = {
  zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  zéro: 0, zero_fr: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six_fr: 6, sept: 7, huit: 8, neuf: 9,
};
const NUMBER_WORDS = {
  ...DIGIT_WORDS,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16,
  "dix-sept": 17, "dix-huit": 18, "dix-neuf": 19, vingt: 20, trente: 30,
};
const NEGATIVE_WORDS = ["minus", "negative", "moins", "négatif", "negatif", "负"];
const ZH_DIGITS = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };

function parseChineseNumber(s) {
  if (!s) return null;
  if (!s.includes("十")) {
    // e.g. "一零一一" read digit by digit
    return s.split("").map((c) => ZH_DIGITS[c]).join("");
  }
  const [tensPart, unitsPart] = s.split("十");
  const tens = tensPart ? ZH_DIGITS[tensPart] : 1;
  const units = unitsPart ? ZH_DIGITS[unitsPart] : 0;
  if (tens === undefined || units === undefined) return null;
  return String(tens * 10 + units);
}

export function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-");
}

// Returns a normalised answer string ("11", "1011", "-1") or null if none found.
export function parseAnswer(raw) {
  if (!raw) return null;
  const text = String(raw).toLowerCase().replace(/[−–—]/g, "-");
  const negative = NEGATIVE_WORDS.some((w) => text.includes(w));
  const sign = (s) => (negative && !s.startsWith("-") ? "-" + s : s);

  // 1. Plain digits typed or recognised ("11", "1011", "-1", "1 0 1 1")
  const compact = text.replace(/\s+/g, "");
  if (/^-?\d+$/.test(compact)) return compact;

  // 2. Digits somewhere inside a sentence: take the last number mentioned
  const digitMatches = text.match(/-?\d+/g);
  if (digitMatches) return sign(digitMatches[digitMatches.length - 1]);

  // 3. Chinese numerals: take the last run
  const zh = text.match(/[零〇一二两三四五六七八九十]+/g);
  if (zh) {
    const n = parseChineseNumber(zh[zh.length - 1]);
    if (n !== null) return sign(n);
  }

  // 4. Number words (English / French)
  const tokens = text.split(/[^a-zà-ÿ-]+/).filter(Boolean);
  // 4a. "one zero one one" → digit sequence
  const digitRun = [];
  let longestRun = [];
  for (const tok of tokens) {
    if (tok in DIGIT_WORDS) {
      digitRun.push(DIGIT_WORDS[tok]);
      if (digitRun.length > longestRun.length) longestRun = [...digitRun];
    } else {
      digitRun.length = 0;
    }
  }
  if (longestRun.length >= 3) return sign(longestRun.join(""));

  // 4b. Otherwise the last number word ("…so eleven" → 11; "twenty one" → 21)
  let last = null;
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok in NUMBER_WORDS) {
      let value = NUMBER_WORDS[tok];
      const next = tokens[i + 1];
      if (value >= 20 && next && next in DIGIT_WORDS && DIGIT_WORDS[next] > 0) {
        value += DIGIT_WORDS[next];
        i++;
      }
      last = value;
    }
  }
  return last === null ? null : sign(String(last));
}

export function isCorrect(question, value) {
  return normalize(value) === normalize(question.answer);
}
