"use client";

import { useEffect, useRef, useState } from "react";
import { TAGS, VOCAB_EXTRA } from "../_lib/data";
import { getTeacherReport, getTeacherSummary } from "../_lib/api";
import { topicName } from "./ui";
import { Bulb, Send } from "./Icons";

const TT = {
  title: { en: "Class overview", fr: "Vue d'ensemble de la classe", zh: "班级概览" },
  refresh: { en: "Refresh data", fr: "Actualiser les données", zh: "刷新数据" },
  retry: { en: "Try again", fr: "Réessayer", zh: "重试" },
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
  teamsRecipients: { en: "Teams recipient emails (comma-separated)", fr: "Adresses des destinataires Teams (séparées par des virgules)", zh: "Teams 收件人邮箱（用逗号分隔）" },
  teamsHelp: { en: "Add recipient email addresses to prefill a new chat draft. Without recipients, the link opens Teams; copy or download the report to share it.", fr: "Ajoutez les adresses des destinataires pour préremplir un nouveau brouillon. Sans destinataire, le lien ouvre Teams; copiez ou téléchargez le rapport pour le partager.", zh: "填写收件人邮箱以预填新聊天草稿。未填写时会打开 Teams；可复制或下载报告后分享。" },
  copyContent: { en: "Copy text", fr: "Copier le texte", zh: "复制文本" },
  copied: { en: "Copied to clipboard.", fr: "Copié dans le presse-papiers.", zh: "已复制到剪贴板。" },
  copyFailed: { en: "Could not copy. Use the download instead.", fr: "Impossible de copier. Téléchargez plutôt le fichier.", zh: "复制失败，请改为下载文件。" },
  reportHint: { en: "Teams opens a draft for review. You choose the destination and send it there.", fr: "Teams ouvre un brouillon à vérifier. Choisissez la destination et envoyez-le dans Teams.", zh: "Teams 将打开待审核草稿。请在 Teams 中选择聊天对象并发送。" },
  empty: { en: "No learner activity yet. This dashboard updates as students complete activities and share feedback.", fr: "Aucune activité pour le moment. Le tableau de bord se met à jour lorsque les élèves terminent des activités.", zh: "暂无学习者活动。学生完成活动并分享反馈后，仪表板会更新。" },
  dataError: { en: "Could not load class data. Check that FastAPI is running and try again.", fr: "Impossible de charger les données. Vérifiez que FastAPI fonctionne et réessayez.", zh: "无法加载班级数据。请检查 FastAPI 是否运行，然后重试。" },
  reportError: { en: "The report could not be generated. Refresh the data and try again.", fr: "Le rapport n'a pas pu être généré. Actualisez les données puis réessayez.", zh: "无法生成报告。请刷新数据后重试。" },
};

const tt = (key, lang, vars = {}) => {
  let text = TT[key][lang] || TT[key].en;
  for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
};

function makeTeamsLink(message, recipients) {
  const users = recipients.split(/[;,\s]+/).map((email) => email.trim()).filter(Boolean);
  if (!users.length) return "https://teams.microsoft.com/v2/";
  const link = new URL("https://teams.microsoft.com/l/chat/0/0");
  link.searchParams.set("users", users.join(","));
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
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

function buildVocabularyCard(lang) {
  const title = lang === "fr" ? "# Fiche de vocabulaire BISECT" : lang === "zh" ? "# BISECT 术语卡" : "# BISECT Vocabulary Card";
  const rows = VOCAB_EXTRA.map((term) => `- **EN:** ${term.en} · **FR:** ${term.fr} · **中文:** ${term.zh}`).join("\n");
  return `${title}\n\n${rows}\n`;
}

export default function TeacherScreen({ lang }) {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [vocabulary, setVocabulary] = useState("");
  const [teamsRecipients, setTeamsRecipients] = useState("");
  const [busy, setBusy] = useState("summary");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const headingRef = useRef(null);

  useEffect(() => {
    let active = true;
    headingRef.current?.focus();
    getTeacherSummary()
      .then((data) => { if (active) setSummary(data); })
      .catch(() => { if (active) setError(tt("dataError", lang)); })
      .finally(() => { if (active) setBusy(""); });
    return () => { active = false; };
  }, [lang]);

  async function refresh() {
    setBusy("summary");
    setError("");
    try {
      setSummary(await getTeacherSummary());
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
      const nextReport = await getTeacherReport(lang);
      setReport(nextReport);
      setSummary(nextReport.summary);
    } catch {
      setError(tt("reportError", lang));
    } finally {
      setBusy("");
    }
  }

  function createVocabularyCard() {
    const markdown = buildVocabularyCard(lang);
    setVocabulary(markdown);
  }

  async function copyContent(text) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(tt("copied", lang));
    } catch {
      setNotice(tt("copyFailed", lang));
    }
  }

  if (!summary) {
    return (
      <main className="bx-main bx-narrow bx-dash">
        <section className="bx-card bx-stack-16">
          <div className="bx-stack-4">
            <p className="bx-tiny-label">BISECT · TEACHER</p>
            <h1 ref={headingRef} tabIndex={-1} className="bx-h1">{tt("title", lang)}</h1>
          </div>
          {busy === "summary" && <p className="bx-muted" role="status">{tt("loading", lang)}</p>}
          {error && <p className="bx-bad" role="alert">{error}</p>}
          {error && <button type="button" className="bx-btn bx-btn-primary" onClick={refresh}>{tt("retry", lang)}</button>}
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
                <button type="button" className="bx-btn bx-btn-ghost" onClick={() => copyContent(vocabulary)}>{tt("copyContent", lang)}</button>
                <a className="bx-link-button" href={makeTeamsLink(vocabulary, teamsRecipients)} target="_blank" rel="noopener noreferrer"><Send size={16} /> {tt("openTeams", lang)}</a>
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
        <label className="bx-field">
          {tt("teamsRecipients", lang)}
          <input className="bx-input" type="text" autoComplete="off" placeholder="teacher@example.edu, colleague@example.edu" value={teamsRecipients} onChange={(event) => setTeamsRecipients(event.target.value)} />
        </label>
        <p className="bx-muted bx-small">{tt("teamsHelp", lang)}</p>
        {report && (
          <div className="bx-stack-12">
            <div className="bx-row-wrap">
              <button type="button" className="bx-btn bx-btn-ghost" onClick={() => downloadMarkdown("bisect-class-report.md", report.markdown)}>{tt("downloadReport", lang)}</button>
              <button type="button" className="bx-btn bx-btn-ghost" onClick={() => copyContent(report.markdown)}>{tt("copyContent", lang)}</button>
              <a className="bx-link-button" href={makeTeamsLink(report.markdown, teamsRecipients)} target="_blank" rel="noopener noreferrer"><Send size={16} /> {tt("openTeams", lang)}</a>
            </div>
            <p className="bx-muted bx-small">{tt("reportHint", lang)}</p>
            <details className="bx-report-details">
              <summary>Preview report</summary>
              <pre className="bx-report-preview">{report.markdown}</pre>
            </details>
          </div>
        )}
        {notice && <p className="bx-muted bx-small" role="status">{notice}</p>}
      </section>
    </main>
  );
}
