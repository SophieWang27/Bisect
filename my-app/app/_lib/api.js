// The browser talks to a same-origin Next.js route, which forwards AI requests
// to the existing FastAPI /explain endpoint without exposing backend settings.
import { CHAIN, LESSONS, QUESTIONS, TOPICS, t } from "./data";

const FALLBACK_TOPICS = CHAIN.map((id) => ({ id, names: TOPICS[id] }));

export async function getTopics() {
  try {
    const response = await fetch("/api/topics", { cache: "no-store" });
    if (!response.ok) throw new Error(`Topics request failed: ${response.status}`);
    const data = await response.json();
    const available = (data.topics || [])
      .filter((topic) => CHAIN.includes(topic.id) && topic.names)
      .map((topic) => ({ id: topic.id, names: { ...TOPICS[topic.id], ...topic.names } }));
    return available.length ? available : FALLBACK_TOPICS;
  } catch (error) {
    console.warn("Topic service unavailable; using the built-in topic list", error);
    return FALLBACK_TOPICS;
  }
}

// The current backend has no answer logging endpoint; answers remain local.
export async function logAnswer(answer) {
  // The current backend has no answer logging endpoint. Keep the demo usable.
  return { ok: true, localOnly: true, answer };
}

// Use Gemini for personalized feedback and retain the built-in translated lesson content.
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
    return { ...fallback, feedback: data.text || fallback.feedback };
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
