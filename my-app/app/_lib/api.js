// The browser talks to a same-origin Next.js route, which forwards AI requests
// to the existing FastAPI /explain endpoint without exposing backend settings.
import { LESSONS, QUESTIONS, TOPICS, t } from "./data";

// Log every answer. The backend needs langShown for language-gap detection.
// answer = { questionId, topicId, mode, value, explanation, langShown, correct }
export async function logAnswer(answer) {
  // The current backend has no answer logging endpoint. Keep the demo usable.
  return { ok: true, localOnly: true, answer };
}

// Lesson for the root topic, aimed at the student's wrong answer.
// The real backend would ask the AI: "write in {lang}, key terms in {courseLang} in brackets,
// address this wrong answer: {wrongValue}, student's explanation: {explanation}".
export async function getLesson({ topicId, wrongValue, explanation, question: attemptedQuestion, lang, courseLang }) {
  const lesson = LESSONS[topicId];
  const question = attemptedQuestion || QUESTIONS[topicId][0];
  const feedback = wrongValue && question.feedback[wrongValue];
  const fallback = {
    feedback: feedback ? feedback[lang] || feedback.en : t("genericWrong", lang),
    body: lesson.body[lang] || lesson.body.en,
    table: lesson.table || null,
    example: lesson.example || null,
  };

  try {
    const data = await explain({
      topic: `${TOPICS[topicId][lang] || TOPICS[topicId].en}${lang !== courseLang ? ` (${TOPICS[topicId][courseLang] || TOPICS[topicId].en})` : ""}`,
      question: question.prompt[lang] || question.prompt.en,
      correct_answer: String(question.answer),
      student_answer: String(wrongValue ?? ""),
      student_explanation: explanation || "",
      lang,
    });
    return { ...fallback, feedback: data || fallback.feedback };
  } catch (e) {
    console.warn("AI explanation unavailable; using the built-in lesson", e);
    return fallback;
  }
}

// Anonymous one-tap tags → teacher dashboard themes.
export async function shareTags(tagIds) {
  // The current backend has no tag storage endpoint; tags stay in this demo session.
  return { ok: true, localOnly: true, tags: tagIds };
}

export async function explain(payload) {
  const res = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return res.json();
}
