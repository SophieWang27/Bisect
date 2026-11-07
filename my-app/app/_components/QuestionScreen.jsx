"use client";
import { useEffect, useRef, useState } from "react";
import { HTML_LANG, LANG_NAMES, t } from "../_lib/data";
import { listenOnce, parseAnswer, parseTypedAnswer } from "../_lib/speech";
import { useSpeechRecognitionAvailable } from "../_lib/useSpeechRecognitionAvailable";
import { ReadAloudButton, TopicWithTerm, WithBinary, Bin } from "./ui";
import { Arrow, Globe, Keyboard, Mic, Radio } from "./Icons";

export default function QuestionScreen({
  question,
  topicId,
  displayLang,
  courseLang,
  myLang,
  progress, // { n, total } or null
  headline, // optional line above the progress bar
  isConfirm,
  isExamLanguage,
  onSubmit,
}) {
  const uiLang = myLang;
  const [shownLang, setShownLang] = useState(displayLang);
  const [mode, setMode] = useState("choose");
  const [choice, setChoice] = useState(null);
  const [typed, setTyped] = useState("");
  const [explanation, setExplanation] = useState("");
  const [voice, setVoice] = useState({ status: "idle", transcript: "", parsed: null, confirmed: false });
  const [explainListening, setExplainListening] = useState(false);
  const canSpeak = useSpeechRecognitionAvailable();
  const headingRef = useRef(null);
  const typedInputRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (mode === "type") typedInputRef.current?.focus();
  }, [mode]);

  const prompt = question.prompt[shownLang] || question.prompt.en;
  const otherLang = shownLang === courseLang ? myLang : courseLang;
  const showToggle = myLang !== courseLang;

  let value = null;
  if (mode === "choose") value = choice;
  if (mode === "type") value = parseTypedAnswer(typed);
  if (mode === "speak") value = voice.confirmed ? voice.parsed : null;

  function startVoiceAnswer() {
    setVoice({ status: "listening", transcript: "", parsed: null, confirmed: false });
    listenOnce(
      shownLang,
      (transcript) => setVoice({ status: "heard", transcript, parsed: parseAnswer(transcript), confirmed: false }),
      (err) => setVoice({ status: err === "unsupported" ? "unsupported" : "idle", transcript: "", parsed: null, confirmed: false }),
      () => setVoice((v) => (v.status === "listening" ? { ...v, status: "idle" } : v))
    );
  }

  function startVoiceExplanation() {
    setExplainListening(true);
    listenOnce(
      myLang,
      (transcript) => setExplanation((prev) => (prev ? prev + " " : "") + transcript),
      () => {},
      () => setExplainListening(false)
    );
  }

  function submit() {
    if (value === null) return;
    onSubmit({ value, mode, explanation: explanation.trim(), langShown: shownLang });
  }

  const modes = [
    { id: "choose", icon: <Radio />, label: t("choose", uiLang) },
    { id: "type", icon: <Keyboard />, label: t("type", uiLang) },
    ...(canSpeak ? [{ id: "speak", icon: <Mic size={18} />, label: t("speak", uiLang) }] : []),
  ];

  return (
    <main className="bx-main bx-narrow">
      <div className="bx-progress-block" aria-live="polite">
        <div className="bx-progress-row">
          <p className="bx-progress-label">
            {headline}
            {progress && !headline && t("checking", uiLang, { n: progress.n, t: progress.total })}
          </p>
          <p className="bx-muted bx-small">{t("noTimer", uiLang)}</p>
        </div>
        {progress && (
          <div
            className="bx-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.n}
            aria-label={t("checking", uiLang, { n: progress.n, t: progress.total })}
          >
            <div className="bx-bar-fill" style={{ width: `${Math.min(100, (progress.n / progress.total) * 100)}%` }} />
          </div>
        )}
      </div>

      <section className="bx-card bx-question-card">
        <div className="bx-row-between">
          <div className="bx-row-wrap">
            <span className="bx-chip bx-chip-muted">
              <TopicWithTerm id={topicId} lang={myLang} courseLang={courseLang} />
            </span>
            {isConfirm && <span className="bx-chip bx-chip-amber">{t("confirmQ", uiLang)}</span>}
            {isExamLanguage && shownLang === courseLang && myLang !== courseLang && (
              <span className="bx-chip bx-chip-indigo">{t("examLanguage", uiLang)}</span>
            )}
          </div>
          <ReadAloudButton text={prompt} lang={shownLang} uiLang={uiLang} />
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="bx-question" lang={HTML_LANG[shownLang]}>
          <WithBinary text={prompt} />
        </h1>

        <div className="bx-stack-8">
          <p className="bx-label">{t("howAnswer", uiLang)}</p>
          <div className="bx-mode-row" role="group" aria-label={t("howAnswer", uiLang)}>
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`bx-mode ${mode === m.id ? "is-active" : ""}`}
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "choose" && (
          <fieldset className="bx-choices">
            <legend className="bx-sr-only">{t("yourAnswer", uiLang)}</legend>
            {question.choices.map((c) => (
              <label key={c} className={`bx-choice ${choice === c ? "is-selected" : ""}`}>
                <input type="radio" name={`q-${question.id}`} value={c} checked={choice === c} onChange={() => setChoice(c)} />
                {question.binary ? <Bin>{c}</Bin> : <span>{c}</span>}
              </label>
            ))}
          </fieldset>
        )}

        {mode === "type" && (
          <label className="bx-field">
            {t("yourAnswer", uiLang)}
            <input
              ref={typedInputRef}
              type="text"
              className="bx-input bx-input-big"
              placeholder={t("typeHere", uiLang)}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </label>
        )}

        {mode === "speak" && (
          <div className="bx-voice-box" role="status">
            {voice.status === "idle" && (
              <button type="button" className="bx-btn bx-btn-primary" onClick={startVoiceAnswer}>
                <Mic /> {t("tapToSpeak", uiLang)}
              </button>
            )}
            {voice.status === "listening" && (
              <p className="bx-listening">
                <span className="bx-dot" aria-hidden="true" /> {t("listening", uiLang)}
              </p>
            )}
            {voice.status === "unsupported" && <p>{t("noSpeech", uiLang)}</p>}
            {voice.status === "heard" && (
              <div className="bx-stack-12">
                <p>
                  {t("iHeard", uiLang)} <em>“{voice.transcript}”</em>
                </p>
                {voice.parsed === null ? (
                  <div className="bx-row-wrap">
                    <p>{t("noNumber", uiLang)}</p>
                    <button type="button" className="bx-btn bx-btn-ghost" onClick={startVoiceAnswer}>{t("tryAgain", uiLang)}</button>
                  </div>
                ) : (
                  <div className="bx-row-between">
                    <span>
                      {t("answerIs", uiLang)} <strong className="bx-big-num">{voice.parsed}</strong>
                    </span>
                    {!voice.confirmed ? (
                      <div className="bx-row-wrap">
                        <button type="button" className="bx-btn bx-btn-ghost" onClick={startVoiceAnswer}>{t("tryAgain", uiLang)}</button>
                        <button type="button" className="bx-btn bx-btn-dark" onClick={() => setVoice((v) => ({ ...v, confirmed: true }))}>
                          {t("yesRight", uiLang)}
                        </button>
                      </div>
                    ) : (
                      <span className="bx-pill bx-pill-mastered">✓ {t("yesRight", uiLang)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bx-stack-8">
          <label htmlFor={`why-${question.id}`} className="bx-label">
            {t("howGotIt", uiLang)} <span className="bx-muted bx-normal">{t("howGotItHint", uiLang)}</span>
          </label>
          <div className="bx-row-input">
            <textarea
              id={`why-${question.id}`}
              className="bx-input"
              rows={2}
              placeholder={t("explainPlaceholder", uiLang)}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
            {canSpeak && (
              <button
                type="button"
                className={`bx-mic-btn ${explainListening ? "is-listening" : ""}`}
                onClick={startVoiceExplanation}
                aria-label={t("explainByVoice", uiLang)}
              >
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="bx-row-between bx-divider-top">
          {showToggle ? (
            <button type="button" className="bx-btn bx-btn-ghost" onClick={() => setShownLang(otherLang)}>
              <Globe />
              <span>{t("showIn", uiLang, { lang: LANG_NAMES[otherLang] })}</span>
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="bx-btn bx-btn-primary bx-btn-lg" onClick={submit} disabled={value === null}>
            {t("checkAnswer", uiLang)} <Arrow />
          </button>
        </div>
      </section>

      <p className="bx-muted bx-small bx-center">{t("secondCheck", uiLang)}</p>
    </main>
  );
}
