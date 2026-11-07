"use client";
import { useEffect, useRef, useState } from "react";
import { HTML_LANG, LANG_NAMES, LANGS, t } from "../_lib/data";
import { getLesson } from "../_lib/api";
import { listenOnce } from "../_lib/speech";
import { useSpeechRecognitionAvailable } from "../_lib/useSpeechRecognitionAvailable";
import { ReadAloudButton, IconSpeakButton, TopicWithTerm, WithBinary, topicName } from "./ui";
import { Arrow, Mic } from "./Icons";

export default function LessonScreen({ topicId, wrongValue, explanation, question, lang, courseLang, onRetest }) {
  const [lesson, setLesson] = useState(null);
  const [teachBack, setTeachBack] = useState("");
  const [listening, setListening] = useState(false);
  const canSpeak = useSpeechRecognitionAvailable();
  const headingRef = useRef(null);

  useEffect(() => {
    let alive = true;
    getLesson({ topicId, wrongValue, explanation, question, lang, courseLang }).then((l) => alive && setLesson(l));
    return () => {
      alive = false;
    };
  }, [topicId, wrongValue, explanation, question, lang, courseLang]);

  useEffect(() => {
    if (lesson) headingRef.current?.focus();
  }, [lesson]);

  if (!lesson) {
    return (
      <main className="bx-main bx-narrow">
        <p className="bx-card" role="status">…</p>
      </main>
    );
  }

  const readText = [lesson.feedback, lesson.body, lesson.table?.result || lesson.example].filter(Boolean).join(" ");

  function voiceTeachBack() {
    setListening(true);
    listenOnce(lang, (tr) => setTeachBack((p) => (p ? p + " " : "") + tr), () => {}, () => setListening(false));
  }

  return (
    <main className="bx-main bx-wide">
      <article className="bx-card bx-lesson">
        <div className="bx-row-between">
          <div className="bx-stack-4">
            <p className="bx-label bx-muted">{t("lessonLabel", lang)}</p>
            <h1 ref={headingRef} tabIndex={-1} className="bx-h1">
              <TopicWithTerm id={topicId} lang={lang} courseLang={courseLang} />
            </h1>
          </div>
          <ReadAloudButton text={readText} lang={lang} />
        </div>

        <div className="bx-callout">
          <p className="bx-callout-title">{t("aboutAnswer", lang)}</p>
          <p lang={HTML_LANG[lang]}><WithBinary text={lesson.feedback} /></p>
        </div>

        <p className="bx-body" lang={HTML_LANG[lang]}>{lesson.body}</p>

        {lesson.table && (
          <div className="bx-stack-8">
            <table className="bx-pv-table">
              <caption className="bx-sr-only">{lesson.table.digits.join("")}</caption>
              <thead>
                <tr>
                  <th scope="row">{t("weight", lang)}</th>
                  {lesson.table.weights.map((w, i) => <th key={i} scope="col" className="bx-pv-weight">{w}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t("digit", lang)}</th>
                  {lesson.table.digits.map((d, i) => <td key={i} className={d === "0" ? "is-zero" : ""}>{d}</td>)}
                </tr>
              </tbody>
            </table>
            <p className="bx-result">{lesson.table.result}</p>
          </div>
        )}

        {lesson.example && (
          <p className="bx-example">
            <span className="bx-label bx-muted">{t("example", lang)}</span>
            <span className="bx-result"><WithBinary text={lesson.example} /></span>
          </p>
        )}

        <div className="bx-soft-box bx-stack-8">
          <label htmlFor="teachback" className="bx-label">
            {t("explainBack", lang)} <span className="bx-muted bx-normal">{t("explainBackHint", lang)}</span>
          </label>
          <div className="bx-row-input">
            <textarea id="teachback" className="bx-input" rows={2} value={teachBack} onChange={(e) => setTeachBack(e.target.value)} />
            {canSpeak && (
              <button type="button" className={`bx-mic-btn ${listening ? "is-listening" : ""}`} onClick={voiceTeachBack} aria-label={t("explainByVoice", lang)}>
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="bx-row-end">
          <button type="button" className="bx-btn bx-btn-primary bx-btn-lg" onClick={onRetest}>
            {t("retest", lang, { topic: topicName(topicId, lang) })} <Arrow />
          </button>
        </div>
      </article>

      <aside className="bx-side">
        <section className="bx-card bx-stack-12">
          <h2 className="bx-h3">{t("keyTerms", lang)}</h2>
          {LANGS.map((l) => (
            <div key={l} className="bx-term-row">
              <div className="bx-stack-0">
                <span className="bx-tiny-label">{l === "zh" ? "中文" : l.toUpperCase()}</span>
                <span className="bx-term-name" lang={HTML_LANG[l]}>{topicName(topicId, l)}</span>
              </div>
              <IconSpeakButton text={topicName(topicId, l)} lang={l} label={t("sayIn", lang, { lang: LANG_NAMES[l] })} />
            </div>
          ))}
        </section>
      </aside>
    </main>
  );
}
