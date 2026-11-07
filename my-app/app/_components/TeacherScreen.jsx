"use client";
import { useEffect, useRef, useState } from "react";
import { CLASS_DATA, TAGS } from "../_lib/data";
import { topicName } from "./ui";
import { Bulb, Send } from "./Icons";

// Teacher text lives here (the dashboard is always in the course language).
const TT = {
  title: { en: "Class overview", fr: "Vue d'ensemble de la classe", zh: "班级概览" },
  sample: { en: "Sample data", fr: "Données d'exemple", zh: "示例数据" },
  sendTeams: { en: "Send summary to Teams", fr: "Envoyer le résumé dans Teams", zh: "发送摘要到 Teams" },
  sentTeams: { en: "Summary sent to the class Teams channel.", fr: "Résumé envoyé au canal Teams de la classe.", zh: "摘要已发送到班级 Teams 频道。" },
  diagnosed: { en: "Students diagnosed", fr: "Étudiants diagnostiqués", zh: "已诊断学生" },
  concept: { en: "Concept gaps", fr: "Lacunes de notion", zh: "概念缺口" },
  language: { en: "Language gaps", fr: "Lacunes de langue", zh: "语言缺口" },
  shared: { en: "Students who shared", fr: "Étudiants ayant partagé", zh: "分享反馈的学生" },
  rootTitle: { en: "Most common root gaps", fr: "Lacunes profondes les plus fréquentes", zh: "最常见的根本缺口" },
  rootSub: { en: "Of students who missed {topic}, where the gap really started", fr: "Parmi les étudiants qui ont raté {topic}, où la lacune commence vraiment", zh: "在没答对{topic}的学生中，缺口真正从哪里开始" },
  suggestion: { en: "Suggestion", fr: "Suggestion", zh: "建议" },
  suggestionText: { en: "Spend 10 minutes on {topic} before the next lecture. It's blocking most of the class.", fr: "Consacrez 10 minutes à {topic} avant le prochain cours. Cela bloque la majorité de la classe.", zh: "下节课前花 10 分钟讲{topic}，它卡住了班上大多数学生。" },
  langTitle: { en: "Language gaps", fr: "Lacunes de langue", zh: "语言缺口" },
  langText: { en: "{n} students got it right in their own language but wrong in the course language. They need the terms, not the concept.", fr: "{n} étudiants ont réussi dans leur langue mais échoué dans la langue du cours. Il leur faut le vocabulaire, pas la notion.", zh: "{n} 名学生用母语答对，但用课程语言答错。他们缺的是术语，不是概念。" },
  sendVocab: { en: "Send them the vocabulary card", fr: "Leur envoyer la carte de vocabulaire", zh: "发送术语卡给他们" },
  themes: { en: "What students told you", fr: "Ce que disent les étudiants", zh: "学生的反馈" },
  themesSub: { en: "Anonymous one-tap tags", fr: "Étiquettes anonymes", zh: "匿名一键标签" },
};
const tt = (k, lang, vars = {}) => {
  let s = TT[k][lang] || TT[k].en;
  for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
  return s;
};

export default function TeacherScreen({ lang, sharedTags }) {
  const [toast, setToast] = useState("");
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  const themes = { ...CLASS_DATA.themes };
  for (const id of sharedTags) themes[id] = (themes[id] || 0) + 1;
  const themeRows = Object.entries(themes).sort((a, b) => b[1] - a[1]);
  const sharedCount = 11 + (sharedTags.length ? 1 : 0);
  const top = CLASS_DATA.rootGaps[0];

  function sendTeams() {
    setToast(tt("sentTeams", lang));
    setTimeout(() => setToast(""), 3500);
  }

  return (
    <main className="bx-main bx-dash">
      <div className="bx-row-between">
        <h1 ref={headingRef} tabIndex={-1} className="bx-h1">{tt("title", lang)} · {topicName("twos_complement", lang)}</h1>
        <div className="bx-row-wrap">
          <span className="bx-chip bx-chip-amber">{tt("sample", lang)}</span>
          <button type="button" className="bx-btn bx-btn-ghost" onClick={sendTeams}><Send /> {tt("sendTeams", lang)}</button>
        </div>
      </div>

      <div className="bx-kpis">
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("diagnosed", lang)}</span><span className="bx-kpi-num">{CLASS_DATA.diagnosed}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("concept", lang)}</span><span className="bx-kpi-num">{CLASS_DATA.conceptGaps}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("language", lang)}</span><span className="bx-kpi-num is-blue">{CLASS_DATA.languageGaps}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("shared", lang)}</span><span className="bx-kpi-num">{sharedCount}</span></div>
      </div>

      <div className="bx-dash-row">
        <section className="bx-card bx-stack-16 bx-grow">
          <div className="bx-stack-4">
            <h2 className="bx-h3">{tt("rootTitle", lang)}</h2>
            <p className="bx-muted bx-small">{tt("rootSub", lang, { topic: topicName("twos_complement", lang) })}</p>
          </div>
          <ul className="bx-bars" aria-hidden="true">
            {CLASS_DATA.rootGaps.map((g, i) => (
              <li key={g.topic}>
                <span className={i === 0 ? "bx-strong" : ""}>{topicName(g.topic, lang)}</span>
                <div className="bx-bar-track"><div className={`bx-bar-val ${i === 0 ? "is-top" : ""}`} style={{ width: `${g.pct}%` }} /></div>
                <span className="bx-strong bx-right">{g.pct}%</span>
              </li>
            ))}
          </ul>
          <table className="bx-sr-only">
            <caption>{tt("rootTitle", lang)}</caption>
            <tbody>
              {CLASS_DATA.rootGaps.map((g) => (
                <tr key={g.topic}><th scope="row">{topicName(g.topic, lang)}</th><td>{g.pct}%</td></tr>
              ))}
            </tbody>
          </table>
          <div className="bx-suggestion">
            <Bulb />
            <div className="bx-stack-4">
              <p className="bx-tiny-label">{tt("suggestion", lang)}</p>
              <p className="bx-suggestion-text">{tt("suggestionText", lang, { topic: topicName(top.topic, lang) })}</p>
            </div>
          </div>
        </section>

        <aside className="bx-side">
          <section className="bx-card bx-stack-12">
            <h2 className="bx-h3">{tt("langTitle", lang)}</h2>
            <p>{tt("langText", lang, { n: CLASS_DATA.languageGaps })}</p>
            <button type="button" className="bx-btn bx-btn-blue" onClick={() => setToast("✓")}>{tt("sendVocab", lang)}</button>
          </section>
          <section className="bx-card bx-stack-12">
            <div className="bx-row-between">
              <h2 className="bx-h3">{tt("themes", lang)}</h2>
              <span className="bx-muted bx-small">{tt("themesSub", lang)}</span>
            </div>
            <ul className="bx-theme-list">
              {themeRows.map(([id, n]) => {
                const tag = TAGS.find((x) => x.id === id);
                return (
                  <li key={id}><span>{tag ? tag[lang] || tag.en : id}</span><strong>{n}</strong></li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      {toast && <div className="bx-toast" role="status">{toast}</div>}
    </main>
  );
}
