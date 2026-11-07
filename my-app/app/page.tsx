<<<<<<< Updated upstream
import { useState } from "react";
=======
"use client";
>>>>>>> Stashed changes

import React, { useState } from "react";

type Language = "English" | "French" | "Mandarin";
type NodeStatus = "not_tested" | "in_progress" | "gap" | "root_cause" | "mastered";
type View = "learn" | "map" | "teacher";
type Stage =
  | "topic_one"
  | "topic_two"
  | "confirmation"
  | "foundation_native"
  | "foundation_confirm"
  | "foundation_course"
  | "lesson"
  | "retest_foundation"
  | "retest_topic"
  | "complete";

interface LocalizedQuestion {
  prompt: string;
  options: string[];
}

interface Question {
  copy: Record<Language, LocalizedQuestion>;
  correctIndex: number;
}

interface LessonTranslation {
  title: string;
  body: string;
  example: string;
}

interface TopicNode {
  id: string;
  title: string;
  detail: string;
  q1: Question;
  q2: Question;
  retestQ: Question;
  lessons: Record<Language, LessonTranslation>;
}

interface StudentNote {
  id: number;
  tags: string[];
  message: string;
  language: Language;
  anonymous: boolean;
  attachedTopic: string;
}

function makeQuestion(
  englishPrompt: string,
  englishOptions: string[],
  frenchPrompt: string,
  frenchOptions: string[],
  mandarinPrompt: string,
  mandarinOptions: string[],
  correctIndex: number,
): Question {
  return {
    copy: {
      English: { prompt: englishPrompt, options: englishOptions },
      French: { prompt: frenchPrompt, options: frenchOptions },
      Mandarin: { prompt: mandarinPrompt, options: mandarinOptions },
    },
    correctIndex,
  };
}

const TOPIC_CHAINS: Record<string, { label: string; tag: string; nodes: TopicNode[] }> = {
  twos_complement: {
    label: "Two's complement",
    tag: "University · Engineering / CS",
    nodes: [
      {
        id: "powers",
        title: "Powers of two",
        detail: "The building blocks",
        q1: makeQuestion(
          "What is 2³?",
          ["8", "6", "9", "5"],
          "Combien vaut 2³ ?",
          ["8", "6", "9", "5"],
          "2³ 等于多少？",
          ["8", "6", "9", "5"],
          0,
        ),
        q2: makeQuestion(
          "Which two powers of 2 add up to 10?",
          ["8 + 2", "4 + 4", "8 + 1", "2 + 2"],
          "Quelles puissances de 2 donnent 10 ?",
          ["8 + 2", "4 + 4", "8 + 1", "2 + 2"],
          "哪两个 2 的幂相加等于 10？",
          ["8 + 2", "4 + 4", "8 + 1", "2 + 2"],
          0,
        ),
        retestQ: makeQuestion(
          "What is 2⁴?",
          ["16", "8", "12", "6"],
          "Combien vaut 2⁴ ?",
          ["16", "8", "12", "6"],
          "2⁴ 等于多少？",
          ["16", "8", "12", "6"],
          0,
        ),
        lessons: {
          English: { title: "Powers grow in steps", body: "Every step to the left doubles the value. A binary place is a power of two.", example: "2⁰ = 1 · 2¹ = 2 · 2² = 4 · 2³ = 8" },
          French: { title: "Les puissances progressent par étapes", body: "Chaque position vers la gauche double la valeur. Une position binaire correspond à une puissance de deux.", example: "2⁰ = 1 · 2¹ = 2 · 2² = 4 · 2³ = 8" },
          Mandarin: { title: "二的幂逐级增长", body: "每向左移动一位，数值就翻倍。二进制中的每一位都对应一个 2 的幂。", example: "2⁰ = 1 · 2¹ = 2 · 2² = 4 · 2³ = 8" },
        },
      },
      {
        id: "place_value",
        title: "Binary place value",
        detail: "What each digit is worth",
        q1: makeQuestion(
          "In 4-bit two's complement, what value does the leftmost bit represent?",
          ["−8", "−4", "+8", "+1"],
          "En complément à deux sur 4 bits, quelle valeur représente le bit de gauche ?",
          ["−8", "−4", "+8", "+1"],
          "在 4 位补码中，最左边一位代表什么数值？",
          ["−8", "−4", "+8", "+1"],
          0,
        ),
        q2: makeQuestion(
          "What are the place values from left to right in 4-bit two's complement?",
          ["−8, 4, 2, 1", "8, 4, 2, 1", "−4, 2, 1, 0", "1, 2, 4, 8"],
          "Quelles sont les valeurs de position, de gauche à droite, sur 4 bits ?",
          ["−8, 4, 2, 1", "8, 4, 2, 1", "−4, 2, 1, 0", "1, 2, 4, 8"],
          "4 位补码从左到右的位权是什么？",
          ["−8, 4, 2, 1", "8, 4, 2, 1", "−4, 2, 1, 0", "1, 2, 4, 8"],
          0,
        ),
        retestQ: makeQuestion(
          "In 4-bit two's complement, what value does the leftmost bit represent?",
          ["−8", "−4", "+8", "+1"],
          "En complément à deux sur 4 bits, quelle valeur représente le bit de gauche ?",
          ["−8", "−4", "+8", "+1"],
          "在 4 位补码中，最左边一位代表什么数值？",
          ["−8", "−4", "+8", "+1"],
          0,
        ),
        lessons: {
          English: { title: "The leftmost place has a different weight", body: "In four-bit two's complement, the places are −8, 4, 2 and 1. Add the weights wherever there is a 1. The leftmost place is negative, which lets the same bits represent negative numbers.", example: "1011 = (−8) + 0 + 2 + 1 = −5" },
          French: { title: "La position de gauche a un poids différent", body: "En complément à deux sur 4 bits, les poids sont −8, 4, 2 et 1. Additionne les poids des positions qui contiennent un 1. La position de gauche est négative.", example: "1011 = (−8) + 0 + 2 + 1 = −5" },
          Mandarin: { title: "最左边一位的位权不同", body: "在 4 位补码中，各位的位权依次是 −8、4、2 和 1。把所有为 1 的位权相加。最左边一位是负数，因此这些位可以表示负数。", example: "1011 = (−8) + 0 + 2 + 1 = −5" },
        },
      },
      {
        id: "bit_flip",
        title: "Bit inversion",
        detail: "Flip each 0 and 1",
        q1: makeQuestion(
          "What is the bitwise inverse of 0101?",
          ["1010", "1011", "0101", "1101"],
          "Quel est l'inverse bit à bit de 0101 ?",
          ["1010", "1011", "0101", "1101"],
          "0101 按位取反后是什么？",
          ["1010", "1011", "0101", "1101"],
          0,
        ),
        q2: makeQuestion(
          "When you invert bits, what happens to each digit?",
          ["0 becomes 1 and 1 becomes 0", "Only the first bit changes", "Every bit becomes 1", "The digits stay the same"],
          "Quand on inverse les bits, que devient chaque chiffre ?",
          ["0 devient 1 et 1 devient 0", "Seul le premier bit change", "Tous les bits deviennent 1", "Les chiffres ne changent pas"],
          "按位取反时，每一位会怎样变化？",
          ["0 变成 1，1 变成 0", "只有第一位变化", "每一位都变成 1", "数字保持不变"],
          0,
        ),
        retestQ: makeQuestion(
          "What is the bitwise inverse of 0011?",
          ["1100", "1101", "0011", "1111"],
          "Quel est l'inverse bit à bit de 0011 ?",
          ["1100", "1101", "0011", "1111"],
          "0011 按位取反后是什么？",
          ["1100", "1101", "0011", "1111"],
          0,
        ),
        lessons: {
          English: { title: "Flip one bit at a time", body: "Bit inversion swaps every 0 for a 1 and every 1 for a 0. Keep the number of bits the same.", example: "0101 → 1010" },
          French: { title: "Inverse chaque bit", body: "L'inversion remplace chaque 0 par un 1 et chaque 1 par un 0. Garde le même nombre de bits.", example: "0101 → 1010" },
          Mandarin: { title: "逐位取反", body: "按位取反会把每个 0 换成 1，把每个 1 换成 0。位数保持不变。", example: "0101 → 1010" },
        },
      },
      {
        id: "twos_comp",
        title: "Two's complement",
        detail: "Represent a negative number",
        q1: makeQuestion(
          "Convert −5 into 4-bit two's complement.",
          ["1011", "1010", "0101", "1101"],
          "Convertis −5 en complément à deux sur 4 bits.",
          ["1011", "1010", "0101", "1101"],
          "将 −5 转换为 4 位补码。",
          ["1011", "1010", "0101", "1101"],
          0,
        ),
        q2: makeQuestion(
          "After flipping the bits of 0101, what comes next?",
          ["Add 1", "Subtract 1", "Keep it as is", "Move the decimal"],
          "Après avoir inversé les bits de 0101, quelle est l'étape suivante ?",
          ["Ajouter 1", "Soustraire 1", "Ne rien changer", "Déplacer la virgule"],
          "将 0101 的各位取反后，下一步是什么？",
          ["加 1", "减 1", "保持不变", "移动小数点"],
          0,
        ),
        retestQ: makeQuestion(
          "Convert −5 into 4-bit two's complement.",
          ["1011", "1010", "0101", "1101"],
          "Convertis −5 en complément à deux sur 4 bits.",
          ["1011", "1010", "0101", "1101"],
          "将 −5 转换为 4 位补码。",
          ["1011", "1010", "0101", "1101"],
          0,
        ),
        lessons: {
          English: { title: "Remember the final +1", body: "To write a negative number in two's complement, write its positive value in binary, flip each bit, then add 1. The +1 is the step that turns 1010 into 1011.", example: "+5: 0101 → flip: 1010 → add 1: 1011 = −5" },
          French: { title: "N'oublie pas le +1 final", body: "Pour écrire un nombre négatif en complément à deux, écris sa valeur positive en binaire, inverse chaque bit, puis ajoute 1. Le +1 transforme 1010 en 1011.", example: "+5 : 0101 → inverse : 1010 → ajoute 1 : 1011 = −5" },
          Mandarin: { title: "别忘了最后加 1", body: "用补码表示负数时，先写出它的正数二进制，再逐位取反，最后加 1。最后这一步会把 1010 变成 1011。", example: "+5：0101 → 取反：1010 → 加 1：1011 = −5" },
        },
      },
    ],
  },
};

const CHAIN = TOPIC_CHAINS.twos_complement;
const PLACE_NODE = CHAIN.nodes.find((node) => node.id === "place_value")!;
const TARGET_NODE = CHAIN.nodes.find((node) => node.id === "twos_comp")!;
const LANGUAGE_META: Record<Language, { label: string; locale: string }> = {
  English: { label: "English", locale: "en-US" },
  French: { label: "Français", locale: "fr-FR" },
  Mandarin: { label: "中文", locale: "zh-CN" },
};
const NOTE_TAGS: Record<Language, string[]> = {
  English: ["I need more time", "I'm worried about the exam", "English terms are hard for me", "I learn better with examples", "I'm falling behind", "I have accommodations"],
  French: ["J'ai besoin de plus de temps", "L'examen m'inquiète", "Les termes anglais sont difficiles", "J'apprends mieux avec des exemples", "Je prends du retard", "J'ai des aménagements"],
  Mandarin: ["我需要更多时间", "我担心考试", "英语术语对我来说很难", "例子能帮助我学习", "我有点跟不上", "我有学习便利安排"],
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    learn: <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22.5z" /><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /><path d="M17 7h2v2" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    ear: <><path d="M6 9a6 6 0 0 1 12 0c0 3-2 4-3 5s-1 2-1 3a2 2 0 0 1-4 0" /><path d="M9 9a3 3 0 0 1 6 0c0 1.6-1 2.2-2 3" /></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" /><path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20M8 6h8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.spark}
    </svg>
  );
}

function MapCard({ stage, rootId, rootMastered, cleanFinish, expanded = false }: {
  stage: Stage;
  rootId: string | null;
  rootMastered: boolean;
  cleanFinish: boolean;
  expanded?: boolean;
}) {
  const statusFor = (id: string): NodeStatus => {
    if (stage === "complete") {
      if (cleanFinish && id !== "twos_comp") return "not_tested";
      return "mastered";
    }
    if (!rootId) {
      if (id === "twos_comp" && (stage === "topic_one" || stage === "topic_two" || stage === "confirmation")) return "in_progress";
      if (id === "place_value" && (stage === "foundation_native" || stage === "foundation_confirm" || stage === "foundation_course")) return "in_progress";
      return "not_tested";
    }
    if (id === rootId) return rootMastered ? "mastered" : "root_cause";
    if (id === "twos_comp" && rootId !== "twos_comp") return "gap";
    if (rootMastered && id === "powers") return "mastered";
    if (rootMastered && id === "bit_flip" && stage === "retest_topic") return "mastered";
    return "not_tested";
  };
  const statusCopy: Record<NodeStatus, { label: string; icon: string }> = {
    not_tested: { label: "Not checked", icon: "?" },
    in_progress: { label: "In progress", icon: "↗" },
    gap: { label: "Gap", icon: "!" },
    root_cause: { label: "Root cause", icon: "◎" },
    mastered: { label: "Mastered", icon: "✓" },
  };

  return (
    <section className={expanded ? "map-card map-card-expanded" : "map-card"} aria-labelledby={expanded ? "full-map-title" : "map-title"}>
      <div className="card-topline">
        <div>
          <p className="eyebrow">YOUR LEARNING MAP</p>
          <h2 id={expanded ? "full-map-title" : "map-title"}>{expanded ? "One idea builds on another" : "Foundations"}</h2>
        </div>
        <span className="mini-count">{CHAIN.nodes.length} topics</span>
      </div>
      <p className="map-intro">Follow the steps behind your answer. Every status has an icon and a label.</p>
      <ol className="map-list">
        {CHAIN.nodes.map((node, index) => {
          const status = statusFor(node.id);
          const meta = statusCopy[status];
          return (
            <li className={"map-row map-row-" + status} key={node.id}>
              <div className="map-connector" aria-hidden="true"><span>{meta.icon}</span></div>
              <div className="map-node-copy">
                <span className="map-node-title">{node.title}</span>
                <span className="map-node-detail">{node.detail}</span>
              </div>
              <span className={"status-label status-" + status}><span aria-hidden="true">{meta.icon}</span>{meta.label}</span>
              {index < CHAIN.nodes.length - 1 && <span className="sr-only"> leads to </span>}
            </li>
          );
        })}
      </ol>
      <div className="map-legend"><span><i className="legend-dot legend-green" /> Mastered</span><span><i className="legend-dot legend-coral" /> Gap found</span><span><i className="legend-dot legend-gray" /> Not checked</span></div>
    </section>
  );
}

function NoteComposer({ language, attachedTopic, onClose, onSave }: {
  language: Language;
  attachedTopic: string;
  onClose: () => void;
  onSave: (note: Omit<StudentNote, "id">) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [saved, setSaved] = useState(false);
  const tags = NOTE_TAGS[language];

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  };

  const save = () => {
    if (selectedTags.length === 0 && message.trim().length === 0) return;
    onSave({ tags: selectedTags, message: message.trim(), language, anonymous, attachedTopic });
    setSaved(true);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="note-dialog" role="dialog" aria-modal="true" aria-labelledby="note-title">
        <button className="icon-button dialog-close" type="button" onClick={onClose} aria-label="Close note"><Icon name="close" /></button>
        {saved ? (
          <div className="note-success" aria-live="polite">
            <div className="success-mark"><Icon name="check" size={25} /></div>
            <p className="eyebrow">NOTE SAVED</p>
            <h2>Thanks for speaking up.</h2>
            <p>Your note is attached to this learning check in the local demo. You can close this window whenever you're ready.</p>
            <button className="primary-button" type="button" onClick={onClose}>Done <Icon name="arrow" /></button>
          </div>
        ) : (
          <>
            <p className="eyebrow">A PRIVATE NOTE TO YOUR TEACHER</p>
            <h2 id="note-title">Anything you'd like your teacher to know?</h2>
            <p className="note-explainer">Choose a quick tag so you don't have to write much. Your learning check is attached automatically.</p>
            <div className="note-attachment"><Icon name="spark" size={16} /><span>Attached: {attachedTopic}</span></div>
            <fieldset className="tag-fieldset">
              <legend>Share what would help</legend>
              <div className="tag-grid">
                {tags.map((tag) => <button key={tag} type="button" className={selectedTags.includes(tag) ? "choice-chip chip-selected" : "choice-chip"} aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>{tag}</button>)}
              </div>
            </fieldset>
            <label className="field-label" htmlFor="teacher-note">Add a note <span>Optional</span></label>
            <textarea id="teacher-note" rows={3} maxLength={400} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add context that would help your teacher. Please avoid health details." />
            <fieldset className="visibility-fieldset">
              <legend>Who can see this?</legend>
              <label className={anonymous ? "radio-card" : "radio-card radio-selected"}><input type="radio" name="note-visibility" checked={!anonymous} onChange={() => setAnonymous(false)} /><span><strong>With my name</strong><small>Your teacher can follow up with you.</small></span></label>
              <label className={anonymous ? "radio-card radio-selected" : "radio-card"}><input type="radio" name="note-visibility" checked={anonymous} onChange={() => setAnonymous(true)} /><span><strong>Anonymous</strong><small>Only contributes to class-wide themes.</small></span></label>
            </fieldset>
            <div className="privacy-note"><Icon name="lock" size={16} /><p>We don't ask for diagnoses or details about accommodations. This prototype saves notes only in this browser session; it does not send them to a teacher yet. Your teacher may not see a future note right away. For urgent support, contact your campus wellness team or local support service.</p></div>
            <div className="dialog-actions"><button className="text-button" type="button" onClick={onClose}>Maybe later</button><button className="primary-button" type="button" onClick={save} disabled={selectedTags.length === 0 && message.trim().length === 0}>Send note <Icon name="arrow" /></button></div>
          </>
        )}
      </section>
    </div>
  );
}

function TeacherDashboard({ notes }: { notes: StudentNote[] }) {
  const languageTag = NOTE_TAGS.English[2];
  const examTag = NOTE_TAGS.English[1];
  const paceTag = NOTE_TAGS.English[0];
  const languageCount = 8 + notes.filter((note) => note.tags.includes(languageTag)).length;
  const examCount = 14 + notes.filter((note) => note.tags.includes(examTag)).length;
  const paceCount = 6 + notes.filter((note) => note.tags.includes(paceTag)).length;
  const namedNotes = notes.filter((note) => !note.anonymous && note.message.trim().length > 0);

  return (
    <div className="teacher-page">
      <div className="section-heading teacher-heading">
        <div><p className="eyebrow">TEACHER VIEW <span className="preview-tag">SAMPLE CLASS DATA</span></p><h1>See the gap.<br /><em>Plan the next lesson.</em></h1><p>Patterns from your class, combined across all learning languages.</p></div>
        <button className="secondary-button" type="button"><span className="course-avatar">CS</span> CS 130 · Foundations <span className="chevron-down">⌄</span></button>
      </div>
      <div className="metric-grid">
        <article className="metric-card"><span className="metric-icon metric-purple"><Icon name="map" /></span><span className="metric-label">Root gaps found</span><strong>23<span className="metric-change">+4 this week</span></strong><p>Place value is the most common starting point.</p></article>
        <article className="metric-card"><span className="metric-icon metric-yellow"><span className="language-symbol">文A</span></span><span className="metric-label">Language gaps</span><strong>{languageCount}<span className="metric-change">of 42 learners</span></strong><p>Concept is clear; course terms need a bridge.</p></article>
        <article className="metric-card"><span className="metric-icon metric-green"><Icon name="message" /></span><span className="metric-label">Student voices</span><strong>{18 + notes.length}<span className="metric-change">notes this month</span></strong><p>Quick themes help you choose what to revisit.</p></article>
      </div>
      <div className="teacher-grid">
        <section className="dashboard-card gap-chart-card">
          <div className="card-topline"><div><p className="eyebrow">FOUNDATION CHECKS</p><h2>Where learning gets stuck</h2></div><span className="period-chip">Last 7 days <span>⌄</span></span></div>
          <p className="subtle-copy">Most common root causes across the class</p>
          <div className="chart-list" role="img" aria-label="Root cause counts: binary place value 23, bit inversion 12, powers of two 7, two's complement steps 5">
            {[{ label: "Binary place value", count: 23, color: "chart-lilac" }, { label: "Bit inversion", count: 12, color: "chart-mint" }, { label: "Powers of two", count: 7, color: "chart-peach" }, { label: "Two's complement steps", count: 5, color: "chart-blue" }].map((bar) => <div className="chart-row" key={bar.label}><div className="chart-label"><span>{bar.label}</span><strong>{bar.count}</strong></div><div className="chart-track"><span className={"chart-fill " + bar.color} style={{ width: ((bar.count / 25) * 100) + "%" }} /></div></div>)}
          </div>
          <p className="chart-footnote"><span className="footnote-dot" /> Questions adapt to each student; every language rolls up to the same topic ID.</p>
        </section>
        <section className="dashboard-card themes-card">
          <div className="card-topline"><div><p className="eyebrow">TELL YOUR TEACHER</p><h2>What students are saying</h2></div><span className="privacy-pill"><Icon name="lock" size={13} /> Grouped themes</span></div>
          <p className="subtle-copy">Only class-wide patterns appear here.</p>
          <div className="theme-item"><div className="theme-icon theme-icon-peach"><Icon name="clock" /></div><div className="theme-text"><strong>Worried about midterm pace</strong><span>Consider a short review session</span></div><b>{examCount}<small> students</small></b></div>
          <div className="theme-item"><div className="theme-icon theme-icon-lilac"><span>文A</span></div><div className="theme-text"><strong>English terms are hard</strong><span>Add a bilingual vocabulary card</span></div><b>{languageCount}<small> students</small></b></div>
          <div className="theme-item"><div className="theme-icon theme-icon-green"><Icon name="book" /></div><div className="theme-text"><strong>Could use more examples</strong><span>Model one worked problem together</span></div><b>{paceCount}<small> students</small></b></div>
          <div className="teacher-suggestion"><span className="suggestion-star"><Icon name="spark" size={17} /></span><p><strong>Teaching suggestion</strong><br />Many students feel rushed. Consider a review session before the midterm.</p><span className="suggestion-arrow"><Icon name="arrow" size={16} /></span></div>
        </section>
      </div>
      <section className="dashboard-card teacher-map-card"><div className="card-topline"><div><p className="eyebrow">CLASS LEARNING MAP</p><h2>Build understanding from the ground up</h2></div><button className="text-button" type="button">View topic map <Icon name="arrow" size={15} /></button></div><div className="class-map-path">{CHAIN.nodes.map((node, index) => <React.Fragment key={node.id}><div className="class-map-node"><span>{String(index + 1).padStart(2, "0")}</span><strong>{node.title}</strong></div>{index < CHAIN.nodes.length - 1 && <span className="class-map-line" aria-hidden="true" />}</React.Fragment>)}</div><p className="subtle-copy class-map-foot">Every response is grouped by topic ID, so students can learn in English, French or Mandarin without splitting the class picture.</p></section>
      {namedNotes.length > 0 && <section className="dashboard-card named-notes-card"><p className="eyebrow">NAMED NOTES</p><h2>Ready for a one-on-one follow-up</h2>{namedNotes.map((note) => <div className="named-note" key={note.id}><span className="note-avatar">S</span><div><strong>Student · {note.attachedTopic}</strong><p>{note.tags.join(" · ")}{note.message ? " — " + note.message : ""}</p></div><span className="seen-label">New</span></div>)}</section>}
      <p className="privacy-foot"><Icon name="lock" size={14} /> Anonymous notes only contribute to grouped class themes. No individual emotion labels are generated.</p>
    </div>
  );
}

export default function Page() {
  const [view, setView] = useState<View>("learn");
  const [stage, setStage] = useState<Stage>("topic_one");
  const [language, setLanguage] = useState<Language>("English");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [rootId, setRootId] = useState<string | null>(null);
  const [rootMastered, setRootMastered] = useState(false);
  const [classification, setClassification] = useState<"language" | "concept" | null>(null);
  const [cleanFinish, setCleanFinish] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [readNotice, setReadNotice] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [notes, setNotes] = useState<StudentNote[]>([]);

  const questionLanguage: Language = ["foundation_native", "foundation_confirm"].includes(stage) ? language : "English";
  const currentQuestion = (() => {
    switch (stage) {
      case "topic_one": return TARGET_NODE.q1;
      case "topic_two": return TARGET_NODE.q2;
      case "confirmation": return makeQuestion(
        "Which sequence correctly represents −5 in 4-bit two's complement?",
        ["Flip 0101, then add 1", "Add 1 to 0101, then flip", "Flip 0101 only", "Subtract 1 from 0101"],
        "Quelle suite représente correctement −5 sur 4 bits ?",
        ["Inverse 0101, puis ajoute 1", "Ajoute 1 à 0101, puis inverse", "Inverse seulement 0101", "Soustrais 1 de 0101"],
        "哪一步能正确表示 4 位补码 −5？",
        ["将 0101 取反，再加 1", "先给 0101 加 1，再取反", "只将 0101 取反", "从 0101 减去 1"],
        0,
      );
      case "foundation_native": return PLACE_NODE.q1;
      case "foundation_confirm": return PLACE_NODE.q2;
      case "foundation_course": return makeQuestion(
        "Which course term names the value of a digit based on its position?",
        ["Sign bit", "Place value", "Carry bit", "Exponent"],
        "Quel terme désigne la valeur d'un chiffre selon sa position ?",
        ["Bit de signe", "Valeur de position", "Bit de retenue", "Exposant"],
        "哪个课程术语表示数字所在位置对应的数值？",
        ["符号位", "位值", "进位位", "指数"],
        1,
      );
      case "retest_foundation": return PLACE_NODE.retestQ;
      case "retest_topic": return TARGET_NODE.retestQ;
      default: return null;
    }
  })();

  const questionCopy = currentQuestion?.copy[questionLanguage];
  const questionStageCopy: Partial<Record<Stage, { eyebrow: string; instruction: string; progress: string }>> = {
    topic_one: { eyebrow: "ORIGINAL TOPIC · 1 OF 2", instruction: "Start with the question that brought you here.", progress: "Checking the original topic" },
    topic_two: { eyebrow: "ORIGINAL TOPIC · 2 OF 2", instruction: "One more question helps confirm the pattern.", progress: "Checking the original topic" },
    confirmation: { eyebrow: "QUICK CONFIRMATION", instruction: "A quick second look helps avoid a false alarm.", progress: "Confirming your answer" },
    foundation_native: { eyebrow: "CHECKING FOUNDATIONS · 1 OF 3", instruction: "Let's check the idea underneath, in your language.", progress: "Checking foundations" },
    foundation_confirm: { eyebrow: "CHECKING FOUNDATIONS · 2 OF 3", instruction: "One more check helps confirm this foundation.", progress: "Checking foundations" },
    foundation_course: { eyebrow: "LANGUAGE CHECK · 3 OF 3", instruction: "Now try the same idea using course-language terms.", progress: "Checking course-language terms" },
    retest_foundation: { eyebrow: "CLIMB BACK UP · 1 OF 2", instruction: "Try the foundation again in the course language.", progress: "Climbing back up" },
    retest_topic: { eyebrow: "CLIMB BACK UP · FINAL CHECK", instruction: "Bring the idea back to the topic you started with.", progress: "Climbing back up" },
  };

  const moveTo = (next: Stage) => {
    setStage(next);
    setSelectedAnswer(null);
    setFeedback("");
    setReadNotice("");
  };

  const finishClean = () => {
    setCleanFinish(true);
    setRootId(null);
    moveTo("complete");
  };

  const diagnose = (id: string, kind: "language" | "concept") => {
    setCleanFinish(false);
    setRootId(id);
    setRootMastered(false);
    setClassification(kind);
    moveTo("lesson");
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    const correct = selectedAnswer === currentQuestion.correctIndex;
    const nextAnswers = { ...answers, [stage]: selectedAnswer };
    setAnswers(nextAnswers);

    switch (stage) {
      case "topic_one":
        moveTo("topic_two");
        break;
      case "topic_two": {
        const firstWasCorrect = nextAnswers.topic_one === TARGET_NODE.q1.correctIndex;
        if (firstWasCorrect && correct) finishClean();
        else if (!firstWasCorrect && !correct) moveTo("foundation_native");
        else moveTo("confirmation");
        break;
      }
      case "confirmation":
        if (correct) finishClean();
        else moveTo("foundation_native");
        break;
      case "foundation_native":
        if (correct) moveTo("foundation_course");
        else moveTo("foundation_confirm");
        break;
      case "foundation_confirm":
        if (correct) moveTo("foundation_course");
        else diagnose("place_value", "concept");
        break;
      case "foundation_course":
        if (correct) diagnose("twos_comp", "concept");
        else diagnose("place_value", "language");
        break;
      case "retest_foundation":
        if (correct) {
          setRootMastered(true);
          moveTo("retest_topic");
        } else setFeedback("Not quite yet. Use the worked example as a guide, then give it another try.");
        break;
      case "retest_topic":
        if (correct) moveTo("complete");
        else setFeedback("Almost there. Start with the positive value, flip each bit, then add 1.");
        break;
      default:
        break;
    }
  };

  const readQuestion = () => {
    if (!questionCopy) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setReadNotice("Read-aloud is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionCopy.prompt + " " + questionCopy.options.join(". "));
    utterance.lang = LANGUAGE_META[questionLanguage].locale;
    window.speechSynthesis.speak(utterance);
    setReadNotice("Reading aloud in " + LANGUAGE_META[questionLanguage].label + ".");
  };

  const saveNote = (note: Omit<StudentNote, "id">) => {
    setNotes((current) => [...current, { ...note, id: Date.now() }]);
  };

  const resetDemo = () => {
    setAnswers({});
    setRootId(null);
    setRootMastered(false);
    setClassification(null);
    setCleanFinish(false);
    moveTo("topic_one");
    setView("learn");
  };

  const stageCopy = questionStageCopy[stage];
  const lessonNode = rootId === "place_value" ? PLACE_NODE : TARGET_NODE;
  const preferredLesson = lessonNode.lessons[language];
  const bannerText = rootId === "place_value" && classification === "language"
    ? "You understand the idea. The course-language term needs a bridge."
    : rootId === "place_value"
      ? "We found a concept gap in binary place value. Let's build it back together."
      : "Your foundations are clear. Let's strengthen the two's complement steps.";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); resetDemo(); }} aria-label="BISECT home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span className="brand-copy"><strong>BISECT</strong><small>LEARNING STUDIO</small></span>
        </a>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button type="button" className={view === "learn" ? "nav-item nav-active" : "nav-item"} onClick={() => setView("learn")}><Icon name="learn" /><span>Learn</span>{view === "learn" && <i className="nav-indicator" />}</button>
          <button type="button" className={view === "map" ? "nav-item nav-active" : "nav-item"} onClick={() => setView("map")}><Icon name="map" /><span>My learning map</span>{view === "map" && <i className="nav-indicator" />}</button>
          <button type="button" className={view === "teacher" ? "nav-item nav-active" : "nav-item"} onClick={() => setView("teacher")}><Icon name="chart" /><span>Teacher view</span>{view === "teacher" && <i className="nav-indicator" />}</button>
        </nav>
        <div className="sidebar-bottom">
          <button className="note-nav-button" type="button" onClick={() => setNoteOpen(true)}><span className="note-nav-icon"><Icon name="message" size={17} /></span><span><strong>Tell your teacher</strong><small>Private · always optional</small></span><Icon name="chevron" size={15} /></button>
          <div className="profile-row"><span className="profile-avatar">S</span><span className="profile-copy"><strong>Student space</strong><small>Taking it one step at a time</small></span><button className="more-button" type="button" aria-label="More profile options">···</button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Learning studio</span><Icon name="chevron" size={13} /><strong>{view === "teacher" ? "Teacher view" : view === "map" ? "My learning map" : "Digital logic"}</strong></div>
          <div className="topbar-actions">
            {view !== "teacher" && <label className="language-control"><span>MY LANGUAGE</span><select aria-label="My language" value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="English">🇬🇧 English</option><option value="French">🇫🇷 Français</option><option value="Mandarin">🇨🇳 中文</option></select><span className="select-chevron">⌄</span></label>}
            <button className="help-button" type="button" aria-label="Help"><span>?</span></button>
          </div>
        </header>

        <div className="page-content">
          {view === "teacher" ? <TeacherDashboard notes={notes} /> : view === "map" ? (
            <div className="map-page">
              <div className="section-heading"><div><p className="eyebrow">YOUR LEARNING MAP <span className="preview-tag">LIVE PREVIEW</span></p><h1>Small ideas build<br /><em>big understanding.</em></h1><p>Move through the foundations at your own pace. There are no timers.</p></div><button className="primary-button" type="button" onClick={() => setView("learn")}>Continue learning <Icon name="arrow" /></button></div>
              <div className="map-page-grid"><MapCard stage={stage} rootId={rootId} rootMastered={rootMastered} cleanFinish={cleanFinish} expanded /><section className="dashboard-card map-explainer"><span className="explainer-symbol"><Icon name="spark" size={21} /></span><p className="eyebrow">HOW TO READ YOUR MAP</p><h2>Your map follows the idea back to its roots.</h2><p>When an answer feels off, BISECT checks earlier ideas one at a time. The map uses both color and a clear icon and label, so the result is easy to scan.</p><div className="explainer-step"><span>01</span><p><strong>Find the starting point</strong><small>Quick questions check the idea under the topic.</small></p></div><div className="explainer-step"><span>02</span><p><strong>Learn in your language</strong><small>Course terms stay nearby so you can connect both.</small></p></div><div className="explainer-step"><span>03</span><p><strong>Climb back up</strong><small>Show what you know in the course language.</small></p></div></section></div>
            </div>
          ) : (
            <>
              <div className="section-heading student-heading">
                <div><p className="eyebrow">{CHAIN.tag} <span className="preview-tag">DEMO SPACE</span></p><h1>Let's find the<br /><em>missing piece.</em></h1><p>One question at a time. No timer, no pressure.</p></div>
                <div className="heading-note"><span className="heading-note-icon"><Icon name="spark" /></span><span><strong>Personalized to you</strong><small>We'll start with what you already know.</small></span></div>
              </div>
              <div className="content-grid">
                <div className="primary-column">
                  {stageCopy && questionCopy ? (
                    <section className="work-card" aria-labelledby="question-title">
                      <div className="question-card-top"><div className="question-kicker"><span className="kicker-orb"><Icon name="spark" size={15} /></span><span>{stageCopy.eyebrow}</span></div><button className="read-button" type="button" onClick={readQuestion}><Icon name="ear" size={17} /><span>Read aloud</span></button></div>
                      <p className="question-instruction">{stageCopy.instruction}</p>
                      {stage === "foundation_native" && <div className="language-tip"><span className="tip-flag">{language === "Mandarin" ? "中" : language === "French" ? "FR" : "EN"}</span><span>Your preferred language is <strong>{LANGUAGE_META[language].label}</strong>. You'll check course terms in English next.</span></div>}
                      {stage === "foundation_course" && <div className="language-tip language-tip-english"><span className="tip-flag">EN</span><span>Course language check · your answers stay the same across languages.</span></div>}
                      <h2 className="question-title" id="question-title" lang={LANGUAGE_META[questionLanguage].locale}>{questionCopy.prompt}</h2>
                      <div className="answer-list" role="group" aria-label="Answer choices">
                        {questionCopy.options.map((option, index) => {
                          const binaryLabel = /^[01]+$/.test(option) ? option.split("").join(" ") : option;
                          return <button className={selectedAnswer === index ? "answer-option answer-selected" : "answer-option"} type="button" key={option + index} aria-pressed={selectedAnswer === index} onClick={() => { setSelectedAnswer(index); setFeedback(""); }}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span className="option-value" aria-label={binaryLabel} lang={LANGUAGE_META[questionLanguage].locale}>{option}</span><span className="option-radio" aria-hidden="true">{selectedAnswer === index && <i />}</span></button>;
                        })}
                      </div>
                      {feedback && <p className="inline-feedback" aria-live="polite">{feedback}</p>}
                      <div className="question-card-bottom"><div className="no-timer"><Icon name="clock" size={15} /><span>{stageCopy.progress} · take your time</span></div><button className="primary-button" type="button" onClick={submitAnswer} disabled={selectedAnswer === null}>{stage === "retest_topic" ? "Finish check" : "Continue"}<Icon name="arrow" /></button></div>
                      {readNotice && <p className="sr-only" aria-live="polite">{readNotice}</p>}
                    </section>
                  ) : stage === "lesson" ? (
                    <section className="lesson-card" aria-labelledby="lesson-title">
                      <div className="lesson-top"><span className="lesson-icon"><Icon name="book" size={20} /></span><span className="lesson-duration"><Icon name="clock" size={14} /> 2-minute lesson</span></div>
                      <p className="eyebrow">YOUR ROOT CAUSE · {lessonNode.title.toUpperCase()}</p>
                      <h2 id="lesson-title" lang={LANGUAGE_META[language].locale}>{preferredLesson.title}</h2>
                      <p className="lesson-copy" lang={LANGUAGE_META[language].locale}>{preferredLesson.body}</p>
                      <div className="worked-example"><span className="example-label">WORKED EXAMPLE</span><p className="binary-example" aria-label={preferredLesson.example.replace(/[01]/g, (digit) => digit + " ")}>{preferredLesson.example}</p></div>
                      {rootId === "place_value" && <div className="vocabulary-card"><div><span className="vocabulary-label">LANGUAGE BRIDGE</span><span className="machine-badge">Machine-translated · unreviewed</span></div><div className="vocabulary-terms"><span className="vocab-native" lang={LANGUAGE_META[language].locale}>{language === "Mandarin" ? "位值" : language === "French" ? "valeur de position" : "place value"}</span><Icon name="arrow" size={17} /><span className="vocab-course">place value</span></div><p>Same idea, connected to the words you'll see in class.</p></div>}
                      <div className={classification === "language" ? "diagnosis-banner diagnosis-language" : "diagnosis-banner"><span className="diagnosis-symbol">{classification === "language" ? "文A" : "◎"}</span><p><strong>{classification === "language" ? "Language gap, not a concept gap" : "A foundation to strengthen"}</strong><span>{bannerText}</span></p></div>
                      <button className="primary-button lesson-continue" type="button" onClick={() => moveTo(rootId === "place_value" ? "retest_foundation" : "retest_topic")}>Ready to climb back up <Icon name="arrow" /></button>
                    </section>
                  ) : (
                    <section className="complete-card" aria-labelledby="complete-title">
                      <div className="complete-art"><span className="complete-orbit orbit-one" /><span className="complete-orbit orbit-two" /><span className="complete-check"><Icon name="check" size={34} /></span><span className="complete-spark spark-one">✦</span><span className="complete-spark spark-two">✧</span></div>
                      <p className="eyebrow">CHECK COMPLETE · NO TIMER, JUST PROGRESS</p>
                      <h2 id="complete-title">{cleanFinish ? "Your foundations are looking solid." : "You made it back to the top."}</h2>
                      <p>{cleanFinish ? "You checked two's complement and showed what you know. Keep building on it." : "You strengthened " + (rootId === "place_value" ? "binary place value" : "two's complement") + " and made it back to your original topic."}</p>
                      <div className="complete-summary"><span className="summary-mark"><Icon name="check" size={16} /></span><span><strong>{cleanFinish ? "Two's complement" : "Learning path rebuilt"}</strong><small>{cleanFinish ? "Understood in the course language" : "From the foundation to the original topic"}</small></span><span className="summary-status">Mastered</span></div>
                      <div className="complete-actions"><button className="primary-button" type="button" onClick={resetDemo}>Try another check <Icon name="arrow" /></button><button className="secondary-button" type="button" onClick={() => setNoteOpen(true)}><Icon name="message" /> Tell your teacher</button></div>
                    </section>
                  )}
                  {stage !== "complete" && <div className="flow-steps" aria-label="Learning check steps"><span className="flow-current"><i>1</i> Find the pattern</span><b /><span className={stage === "lesson" || stage.startsWith("retest") ? "flow-current" : ""}><i>2</i> Understand it</span><b /><span className={stage.startsWith("retest") ? "flow-current" : ""}><i>3</i> Climb back up</span></div>}
                </div>
                <aside className="side-column">
                  <MapCard stage={stage} rootId={rootId} rootMastered={rootMastered} cleanFinish={cleanFinish} />
                  <section className="calm-card"><div className="calm-decoration"><span /><span /><span /></div><span className="calm-icon"><Icon name="spark" size={18} /></span><p className="eyebrow">YOUR SPACE, YOUR PACE</p><h2>Understanding takes the time it takes.</h2><p>We'll trace the steps back together. You can pause, change language, or ask for a lesson whenever you need.</p><button className="calm-link" type="button" onClick={() => setNoteOpen(true)}>Share what would help <Icon name="arrow" size={15} /></button></section>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
      {noteOpen && <NoteComposer language={language} attachedTopic={rootId ? CHAIN.nodes.find((node) => node.id === rootId)!.title : CHAIN.label} onClose={() => setNoteOpen(false)} onSave={saveNote} />}
    </div>
  );
}
