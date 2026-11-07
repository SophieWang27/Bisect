"use client";

import { useEffect, useRef, useState } from "react";
import { TAGS, VOCAB_EXTRA } from "../_lib/data";
import { getTeacherReport, getTeacherSummary } from "../_lib/api";
import { topicName } from "./ui";
import { Bulb, Send } from "./Icons";

const TT = {
  title: { en: "Class overview", fr: "Vue d'ensemble de la classe", zh: "班级概览" },
  accessTitle: { en: "Teacher access", fr: "Accès enseignant", zh: "教师访问" },
  accessHint: { en: "Enter the teacher access code configured for this BISECT class.", fr: "Saisissez le code d'accès enseignant configuré pour cette classe BISECT.", zh: "输入为此 BISECT 班级设置的教师访问码。" },
  accessLabel: { en: "Teacher access code", fr: "Code d'accès enseignant", zh: "教师访问码" },
  accessHelp: { en: "Set TEACHER_ACCESS_TOKEN in my-app/.env, then enter the same value here.", fr: "Définissez TEACHER_ACCESS_TOKEN dans my-app/.env, puis saisissez la même valeur ici.", zh: "在 my-app/.env 中设置 TEACHER_ACCESS_TOKEN，然后在此输入相同的值。" },
  unlock: { en: "Open dashboard", fr: "Ouvrir le tableau de bord", zh: "打开仪表板" },
  refresh: { en: "Refresh data", fr: "Actualiser les données", zh: "刷新数据" },
  signOut: { en: "Lock dashboard", fr: "Verrouiller le tableau de bord", zh: "锁定仪表板" },
  loading: { en: "Loading…", fr: "Chargement…", zh: "正在加载…" },
  active: { en: "Anonymous sessions", fr: "Sessions anonymes", zh: "匿名学习会话" },
  diagnosed: { en: "Completed diagnoses", fr: "Diagnostics terminés", zh: "已完成诊断" },
  concept: { en: "Concept gaps", fr: "Lacunes conceptuelles", zh: "概念缺口" },
  language: { en: "Language gaps", fr: "Lacunes linguistiques", zh: "语言缺口" },
  shared: { en: "Shared feedback", fr: "Commentaires partagés", zh: "已分享反馈" },
  answers: { en: "Answers recorded", fr: "Réponses enregistrées", zh: "已记录答案" },
  rootTitle: { en: "Root concept gaps", fr: "Lacunes conceptuelles profondes", zh: "根本概念缺口" },
  rootSub: { en: "Share of diagnosed concept gaps by topic", fr: "Part des lacunes diagnostiquées par sujet", zh: "按主题划分的已诊断概念缺口" },
  noRoot: { en: "No concept gaps have been recorded yet.", fr: "Aucune lacune conceptuelle n'a encore été enregistrée.", zh: "尚未记录概念缺口。" },
  suggestion: { en: "Teaching focus", fr: "Priorité pédagogique", zh: "教学重点" },
  suggestionText: { en: "Review {topic} in the next lesson. It is the most frequent root gap in the recorded sessions.", fr: "Révisez {topic} au prochain cours. C'est la lacune profonde la plus fréquente dans les sessions enregistrées.", zh: "建议在下一课复习{topic}。这是已记录会话中最常见的根本缺口。" },
  vocab: { en: "Class vocabulary card", fr: "Fiche de vocabulaire", zh: "班级术语卡" },
  vocabText: { en: "Create a shareable multilingual vocabulary card for the whole class.", fr: "Créez une fiche de vocabulaire multilingue à partager avec la classe.", zh: "为全班创建可分享的多语言术语卡。" },
  createVocab: { en: "Create vocabulary card", fr: "Créer la fiche de vocabulaire", zh: "创建术语卡" },
  downloadCard: { en: "Download vocabulary card", fr: "Télécharger la fiche", zh: "下载术语卡" },
  themes: { en: "Anonymous learner feedback", fr: "Commentaires anonymes des élèves", zh: "学习者匿名反馈" },
  noThemes: { en: "No feedback tags have been shared yet.", fr: "Aucune étiquette de commentaire n'a encore été partagée.", zh: "尚未收到反馈标签。" },
  report: { en: "Class report", fr: "Rapport de classe", zh: "班级报告" },
  generateReport: { en: "Generate report", fr: "Générer le rapport", zh: "生成报告" },
  downloadReport: { en: "Download report", fr: "Télécharger le rapport", zh: "下载报告" },
  openTeams: { en: "Open Teams chat draft", fr: "Ouvrir le brouillon Teams", zh: "打开 Teams 聊天草稿" },
  reportHint: { en: "Teams opens a draft with the summary. Review it, choose a chat, and press Send there.", fr: "Teams ouvre un brouillon. Vérifiez-le, choisissez une conversation, puis envoyez-le dans Teams.", zh: "Teams 将打开摘要草稿。请检查内容、选择聊天对象并在 Teams 中发送。" },
  empty: { en: "No learner activity yet. This dashboard updates as students complete activities and share feedback.", fr: "Aucune activité pour le moment. Le tableau de bord se met à jour lorsque les élèves terminent des activités.", zh: "暂无学习者活动。学生完成活动并分享反馈后，仪表板会更新。" },
  accessDenied: { en: "The access code was rejected or teacher access is not configured.", fr: "Le code est incorrect ou l'accès enseignant n'est pas configuré.", zh: "访问码错误或尚未配置教师访问。" },
  dataError: { en: "Could not load class data. Check that FastAPI is running and try again.", fr: "Impossible de charger les données. Vérifiez que FastAPI fonctionne et réessayez.", zh: "无法加载班级数据。请检查 FastAPI 是否运行，然后重试。" },
  reportError: { en: "The report could not be generated. Refresh the data and try again.", fr: "Le rapport n'a pas pu être généré. Actualisez les données puis réessayez.", zh: "无法生成报告。请刷新数据后重试。" },
};

const tt = (key, lang, vars = {}) => {
  let text = TT[key][lang] || TT[key].en;
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
};

function makeTeamsLink(message) {
  const link = new URL("https://teams.microsoft.com/l/chat/0/0");
  link.searchParams.set("message", message);
  return link.toString();
}

function downloadMarkdown(filename, markdown) {
  const blobUrl = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}

function buildVocabularyCard(lang) {
  const title = lang === "fr" ? "# Fiche de vocabulaire BISECT" : lang === "zh" ? "# BISECT 术语卡" : "# BISECT Vocabulary Card";
  const rows = VOCAB_EXTRA.map((term) => `- **EN:** ${term.en} · **FR:** ${term.fr} · **中文:** ${term.zh}`).join("\n");
  return `${title}\n\n${rows}\n`;
}

export default function TeacherScreen({ lang }) {
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [vocabulary, setVocabulary] = useState("");
  const [reportTeamsLink, setReportTeamsLink] = useState("");
  const [vocabularyTeamsLink, setVocabularyTeamsLink] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef(null);

  useEffect(() => headingRef.current?.focus(), []);

  async function unlock(event) {
    event.preventDefault();
    if (!token.trim()) return;
    setBusy("summary");
    setError("");
    try {
      setSummary(await getTeacherSummary(token.trim()));
    } catch (requestError) {
      setSummary(null);
      setError(requestError.message || tt("accessDenied", lang));
    } finally {
      setBusy("");
    }
  }

  async function refresh() {
    setBusy("summary");
    setError("");
    try {
      setSummary(await getTeacherSummary(token.trim()));
    } catch {
      setError(tt("dataError", lang));
    } finally {
      setBusy("");
    }
  }

  async function generateReport() {
    setBusy("report");
    setError("");
    try {
      const nextReport = await getTeacherReport(token.trim(), lang);
      setReport(nextReport);
      setSummary(nextReport.summary);
      setReportTeamsLink(makeTeamsLink(nextReport.markdown));
    } catch {
      setError(tt("reportError", lang));
    } finally {
      setBusy("");
    }
  }

  function createVocabularyCard() {
    const markdown = buildVocabularyCard(lang);
    setVocabulary(markdown);
    setVocabularyTeamsLink(makeTeamsLink(markdown));
  }

  function lockDashboard() {
    setToken("");
    setSummary(null);
    setReport(null);
    setVocabulary("");
    setReportTeamsLink("");
    setVocabularyTeamsLink("");
  }

  if (!summary) {
    return (
      <main className="bx-main bx-narrow bx-dash">
        <section className="bx-card bx-stack-16 bx-teacher-access">
          <div className="bx-stack-4">
            <p className="bx-tiny-label">BISECT · TEACHER</p>
            <h1 ref={headingRef} tabIndex={-1} className="bx-h1">{tt("accessTitle", lang)}</h1>
            <p className="bx-muted">{tt("accessHint", lang)}</p>
          </div>
          <form className="bx-stack-12" onSubmit={unlock}>
            <label className="bx-field">
              {tt("accessLabel", lang)}
              <input className="bx-input" type="password" autoComplete="current-password" value={token} onChange={(event) => setToken(event.target.value)} />
            </label>
            <p className="bx-muted bx-small">{tt("accessHelp", lang)}</p>
            {error && <p className="bx-bad" role="alert">{error}</p>}
            <button type="submit" className="bx-btn bx-btn-primary" disabled={!token.trim() || busy === "summary"}>
              {busy === "summary" ? tt("loading", lang) : tt("unlock", lang)}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const themeRows = Object.entries(summary.themes || {})
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1]);
  const topGap = summary.rootGaps[0];

  return (
    <main className="bx-main bx-dash">
      <div className="bx-row-between bx-teacher-heading">
        <div className="bx-stack-4">
          <p className="bx-tiny-label">BISECT · {summary.classId}</p>
          <h1 ref={headingRef} tabIndex={-1} className="bx-h1">{tt("title", lang)}</h1>
        </div>
        <div className="bx-row-wrap">
          <span className="bx-chip bx-chip-blue">{summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : "No saved activity"}</span>
          <button type="button" className="bx-btn bx-btn-ghost" onClick={refresh} disabled={busy !== ""}>
            {busy === "summary" ? tt("loading", lang) : tt("refresh", lang)}
          </button>
          <button type="button" className="bx-btn bx-btn-ghost" onClick={lockDashboard}>{tt("signOut", lang)}</button>
        </div>
      </div>

      {error && <p className="bx-card bx-bad bx-dash-alert" role="alert">{error}</p>}

      <div className="bx-kpis">
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("active", lang)}</span><span className="bx-kpi-num">{summary.activeSessions}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("diagnosed", lang)}</span><span className="bx-kpi-num">{summary.diagnosed}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("concept", lang)}</span><span className="bx-kpi-num">{summary.conceptGaps}</span></div>
        <div className="bx-card bx-kpi"><span className="bx-muted">{tt("language", lang)}</span><span className="bx-kpi-num is-blue">{summary.languageGaps}</span></div>
      </div>

      {summary.activeSessions === 0 && <p className="bx-card bx-empty-state">{tt("empty", lang)}</p>}

      <div className="bx-dash-row">
        <section className="bx-card bx-stack-16 bx-grow">
          <div className="bx-stack-4">
            <h2 className="bx-h3">{tt("rootTitle", lang)}</h2>
            <p className="bx-muted bx-small">{tt("rootSub", lang)}</p>
          </div>
          {summary.rootGaps.length ? (
            <ul className="bx-bars">
              {summary.rootGaps.map((gap, index) => (
                <li key={gap.topic}>
                  <span className={index === 0 ? "bx-strong" : ""}>{topicName(gap.topic, lang)}</span>
                  <div className="bx-bar-track" aria-label={`${gap.pct}%`}><div className={`bx-bar-val ${index === 0 ? "is-top" : ""}`} style={{ width: `${gap.pct}%` }} /></div>
                  <span className="bx-strong bx-right">{gap.count} · {gap.pct}%</span>
                </li>
              ))}
            </ul>
          ) : <p className="bx-muted">{tt("noRoot", lang)}</p>}
          {topGap && (
            <div className="bx-suggestion">
              <Bulb />
              <div className="bx-stack-4">
                <p className="bx-tiny-label">{tt("suggestion", lang)}</p>
                <p className="bx-suggestion-text">{tt("suggestionText", lang, { topic: topicName(topGap.topic, lang) })}</p>
              </div>
            </div>
          )}
        </section>

        <aside className="bx-side">
          <section className="bx-card bx-stack-12">
            <h2 className="bx-h3">{tt("vocab", lang)}</h2>
            <p className="bx-muted">{tt("vocabText", lang)}</p>
            <button type="button" className="bx-btn bx-btn-blue" onClick={createVocabularyCard}>{tt("createVocab", lang)}</button>
            {vocabulary && (
              <div className="bx-stack-8">
                <button type="button" className="bx-btn bx-btn-ghost" onClick={() => downloadMarkdown("bisect-vocabulary-card.md", vocabulary)}>{tt("downloadCard", lang)}</button>
                <a className="bx-link-button" href={vocabularyTeamsLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> {tt("openTeams", lang)}</a>
              </div>
            )}
          </section>
          <section className="bx-card bx-stack-12">
            <div className="bx-row-between">
              <h2 className="bx-h3">{tt("themes", lang)}</h2>
              <span className="bx-muted bx-small">{tt("shared", lang)}: {summary.sharedSessions}</span>
            </div>
            {themeRows.length ? (
              <ul className="bx-theme-list">
                {themeRows.map(([id, count]) => {
                  const tag = TAGS.find((item) => item.id === id);
                  return <li key={id}><span>{tag ? tag[lang] || tag.en : id}</span><strong>{count}</strong></li>;
                })}
              </ul>
            ) : <p className="bx-muted bx-small">{tt("noThemes", lang)}</p>}
          </section>
        </aside>
      </div>

      <section className="bx-card bx-stack-12 bx-report-card">
        <div className="bx-row-between">
          <div className="bx-stack-4">
            <h2 className="bx-h3">{tt("report", lang)}</h2>
            <p className="bx-muted bx-small">{tt("answers", lang)}: {summary.answerCount} · Retained for {summary.retentionDays} days</p>
          </div>
          <button type="button" className="bx-btn bx-btn-dark" onClick={generateReport} disabled={busy !== ""}>
            <Send size={17} /> {busy === "report" ? tt("loading", lang) : tt("generateReport", lang)}
          </button>
        </div>
        {report && (
          <div className="bx-stack-12">
            <div className="bx-row-wrap">
              <button type="button" className="bx-btn bx-btn-ghost" onClick={() => downloadMarkdown("bisect-class-report.md", report.markdown)}>{tt("downloadReport", lang)}</button>
              <a className="bx-link-button" href={reportTeamsLink} target="_blank" rel="noopener noreferrer"><Send size={16} /> {tt("openTeams", lang)}</a>
            </div>
            <p className="bx-muted bx-small">{tt("reportHint", lang)}</p>
            <details className="bx-report-details">
              <summary>Preview report</summary>
              <pre className="bx-report-preview">{report.markdown}</pre>
            </details>
          </div>
        )}
      </section>
    </main>
  );
}
