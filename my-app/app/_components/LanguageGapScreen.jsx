"use client";
import { useEffect, useRef, useState } from "react";
import { CHAIN, HTML_LANG, LANG_NAMES, LANGS, VOCAB_EXTRA, t } from "../_lib/data";
import { listenOnce } from "../_lib/speech";
import { useSpeechRecognitionAvailable } from "../_lib/useSpeechRecognitionAvailable";
import { IconSpeakButton, topicName } from "./ui";
import { Arrow, Check, Cross, Globe, Mic } from "./Icons";
import TagsPanel from "./TagsPanel";

const simplify = (s) => s.toLowerCase().replace(/[’'`]/g, "").replace(/\s+/g, " ").trim();

export default function LanguageGapScreen({ lang, courseLang, onRetry, sessionId }) {
  const topic = CHAIN[0];
  const [practice, setPractice] = useState("");
  const [result, setResult] = useState(null); // "right" | "wrong" | null
  const canSpeak = useSpeechRecognitionAvailable();
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const courseTerm = topicName(topic, courseLang);
  const myTerm = topicName(topic, lang);

  function check(value = practice) {
    setResult(simplify(value).includes(simplify(courseTerm)) ? "right" : "wrong");
  }

  function voice() {
    listenOnce(courseLang, (tr) => {
      setPractice(tr);
      check(tr);
    });
  }

  return (
    <main className="bx-main bx-wide">
      <article className="bx-card bx-lesson">
        <div className="bx-stack-8">
          <span className="bx-chip bx-chip-blue"><Globe size={16} /> {t("languageGap", lang)}</span>
          <h1 ref={headingRef} tabIndex={-1} className="bx-h1">
            {t("langGapTitle", lang, { topic: myTerm, course: LANG_NAMES[courseLang] })}
          </h1>
        </div>

        <div className="bx-grid-2">
          <div className="bx-evidence is-good">
            <span className="bx-small bx-muted">{t("askedIn", lang, { lang: LANG_NAMES[lang] })}</span>
            <span className="bx-evidence-value"><Check size={18} /> {t("correct", lang)}</span>
          </div>
          <div className="bx-evidence is-bad">
            <span className="bx-small bx-muted">{t("askedIn", lang, { lang: LANG_NAMES[courseLang] })}</span>
            <span className="bx-evidence-value"><Cross size={18} /> {t("wrong", lang)}</span>
          </div>
        </div>

        <section className="bx-soft-box bx-stack-12">
          <h2 className="bx-h3">{t("vocabCard", lang)}</h2>
          <div className="bx-grid-3">
            {[courseLang, ...LANGS.filter((l) => l !== courseLang)].map((l) => (
              <div key={l} className={`bx-vocab ${l === courseLang ? "is-course" : ""}`}>
                <span className="bx-tiny-label">
                  {l === "zh" ? "中文" : l.toUpperCase()}
                  {l === courseLang ? ` · ${t("examLanguage", lang)}` : ""}
                </span>
                <div className="bx-row-between">
                  <span className="bx-term-name" lang={HTML_LANG[l]}>{topicName(topic, l)}</span>
                  <IconSpeakButton text={topicName(topic, l)} lang={l} label={t("sayIn", lang, { lang: LANG_NAMES[l] })} />
                </div>
              </div>
            ))}
          </div>
          <p className="bx-muted">
            {t("alsoWatch", lang)}{" "}
            {VOCAB_EXTRA.map((v, i) => (
              <span key={v.en}>
                <strong lang={HTML_LANG[courseLang]}>{v[courseLang]}</strong>
                {lang !== courseLang && <> (<span lang={HTML_LANG[lang]}>{v[lang]}</span>)</>}
                {i < VOCAB_EXTRA.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </section>

        <div className="bx-stack-8">
          <label htmlFor="practice" className="bx-label">
            {t("practiceQ", lang, { course: LANG_NAMES[courseLang], term: myTerm })}
          </label>
          <div className="bx-row-input">
            <input
              id="practice"
              className="bx-input bx-input-big"
              placeholder={t("sayOrType", lang)}
              value={practice}
              onChange={(e) => {
                setPractice(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && check()}
              lang={HTML_LANG[courseLang]}
              autoComplete="off"
            />
            {canSpeak && (
              <button type="button" className="bx-mic-btn" onClick={voice} aria-label={t("speak", lang)}>
                <Mic size={24} />
              </button>
            )}
            <button type="button" className="bx-btn bx-btn-ghost" onClick={() => check()}>{t("check", lang)}</button>
          </div>
          <p role="status" className={result === "right" ? "bx-good" : result === "wrong" ? "bx-bad" : ""}>
            {result === "right" && t("niceTerm", lang)}
            {result === "wrong" && t("notTerm", lang)}
          </p>
        </div>

        <div className="bx-row-end">
          <button type="button" className="bx-btn bx-btn-primary bx-btn-lg" onClick={onRetry}>
            {t("retryIn", lang, { lang: LANG_NAMES[courseLang] })} <Arrow />
          </button>
        </div>
      </article>

      <aside className="bx-side">
        <TagsPanel lang={lang} sessionId={sessionId} />
      </aside>
    </main>
  );
}
