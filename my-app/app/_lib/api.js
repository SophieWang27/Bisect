// The one place the frontend talks to the backend.
// USE_MOCK = true → everything runs in the browser with data.js (safe for the demo).
// When the FastAPI backend is ready, set USE_MOCK = false and match these function shapes.
import { LESSONS, QUESTIONS, t } from "./data";

export const USE_MOCK = true;
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

// Log every answer. The backend needs langShown for language-gap detection.
// answer = { questionId, topicId, mode, value, explanation, langShown, correct }
export async function logAnswer(answer) {
  if (USE_MOCK) return { ok: true };
  try {
    return await post("/answers", answer);
  } catch (e) {
    console.warn("logAnswer failed, continuing offline", e);
    return { ok: false };
  }
}

// Lesson for the root topic, aimed at the student's wrong answer.
// The real backend would ask the AI: "write in {lang}, key terms in {courseLang} in brackets,
// address this wrong answer: {wrongValue}, student's explanation: {explanation}".
export async function getLesson({ topicId, wrongValue, explanation, lang, courseLang }) {
  const mock = () => {
    const lesson = LESSONS[topicId];
    const q = QUESTIONS[topicId][0];
    const fb = wrongValue && q.feedback[wrongValue];
    return {
      feedback: fb ? fb[lang] || fb.en : t("genericWrong", lang),
      body: lesson.body[lang] || lesson.body.en,
      table: lesson.table || null,
      example: lesson.example || null,
    };
  };
  if (USE_MOCK) return mock();
  try {
    return await post("/lesson", { topicId, wrongValue, explanation, lang, courseLang });
  } catch (e) {
    console.warn("getLesson failed, using cached lesson", e);
    return mock();
  }
}

// Anonymous one-tap tags → teacher dashboard themes.
export async function shareTags(tagIds) {
  if (USE_MOCK) return { ok: true };
  try {
    return await post("/tags", { tags: tagIds });
  } catch {
    return { ok: false };
  }
}

export async function explain(payload) {
  const res = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const data = await res.json();
  return data.text;
}
