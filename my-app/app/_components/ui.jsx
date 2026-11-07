"use client";
import { LANGS, LANG_NAMES, HTML_LANG, TOPICS, t } from "../_lib/data";
import { speak } from "../_lib/speech";
import { Logo, Speaker, Check, Cross, Question } from "./Icons";

export function Header({ courseLang, myLang, setCourseLang, setMyLang, topicLabel, isTeacher }) {
  const uiLang = isTeacher ? courseLang : myLang;
  return (
    <header className="bx-header">
      <div className="bx-brand">
        <Logo />
        <span className="bx-wordmark">DELTALEARN</span>
        {topicLabel && <span className="bx-chip">{topicLabel}</span>}
        {isTeacher && <span className="bx-chip bx-chip-muted">{t("teacherView", uiLang)}</span>}
      </div>
      <div className="bx-lang-row">
        <label className="bx-select-label">
          {t("courseLanguage", uiLang)}
          <select value={courseLang} onChange={(e) => setCourseLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l} value={l} lang={HTML_LANG[l]}>{LANG_NAMES[l]}</option>
            ))}
          </select>
        </label>
        {!isTeacher && (
          <label className="bx-select-label">
            {t("myLanguage", uiLang)}
            <select value={myLang} onChange={(e) => setMyLang(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l} value={l} lang={HTML_LANG[l]}>{LANG_NAMES[l]}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </header>
  );
}

// Status is never colour alone: icon + text label + border style.
export function StatusPill({ status, lang }) {
  const map = {
    mastered: { cls: "bx-pill-mastered", icon: <Check size={14} />, label: t("mastered", lang) },
    gap: { cls: "bx-pill-gap", icon: <Cross size={14} />, label: t("gap", lang) },
    untested: { cls: "bx-pill-untested", icon: <Question size={14} />, label: t("untested", lang) },
  };
  const s = map[status] || map.untested;
  return (
    <span className={`bx-pill ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export function ReadAloudButton({ text, lang, uiLang, label }) {
  return (
    <button type="button" className="bx-btn bx-btn-ghost" onClick={() => speak(text, lang)} aria-label={label || t("readAloud", uiLang || lang)}>
      <Speaker />
      <span>{t("readAloud", uiLang || lang)}</span>
    </button>
  );
}

export function IconSpeakButton({ text, lang, label }) {
  return (
    <button type="button" className="bx-icon-btn" onClick={() => speak(text, lang)} aria-label={label}>
      <Speaker size={18} />
    </button>
  );
}

// "1011" → screen readers say "1 0 1 1" instead of "one thousand eleven".
export function Bin({ children }) {
  const s = String(children);
  return (
    <span className="bx-mono" aria-label={s.split("").join(" ")}>
      {s}
    </span>
  );
}

// Splits a sentence on binary-looking numbers (4+ digits of 0/1) so each gets digit-by-digit reading.
export function WithBinary({ text }) {
  const parts = String(text).split(/(\b[01]{4,}\b)/g);
  return parts.map((p, i) => (/^[01]{4,}$/.test(p) ? <Bin key={i}>{p}</Bin> : <span key={i}>{p}</span>));
}

export function topicName(id, lang) {
  return TOPICS[id] ? TOPICS[id][lang] || TOPICS[id].en : id;
}

// Topic in the student's language, with the course-language term in brackets when different.
export function TopicWithTerm({ id, lang, courseLang }) {
  const main = topicName(id, lang);
  if (lang === courseLang) return <span>{main}</span>;
  return (
    <span>
      <span lang={HTML_LANG[lang]}>{main}</span>{" "}
      <span className="bx-term" lang={HTML_LANG[courseLang]}>({topicName(id, courseLang)})</span>
    </span>
  );
}
