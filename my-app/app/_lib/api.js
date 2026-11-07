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

// Persist only anonymous learning signals; free-text answers and explanations stay private.
export async function logAnswer({ sessionId, questionId, topicId, phase, correct, mode, learnerLang, courseLang }) {
  if (!sessionId) return false;
  try {
    const response = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        session_id: sessionId,
        topic_id: topicId,
        question_id: questionId,
        phase,
        correct,
        answer_mode: mode,
        learner_language: learnerLang,
        course_language: courseLang,
      }),
    });
    if (!response.ok) throw new Error(`Answer logging failed: ${response.status}`);
    return true;
  } catch (error) {
    console.error("Could not save anonymous learning activity.", error);
    return false;
  }
}

export async function logOutcome({ sessionId, startTopic, rootTopic = null, outcome }) {
  if (!sessionId) return false;
  try {
    const response = await fetch("/api/outcomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        start_topic: startTopic,
        root_topic: rootTopic,
        outcome,
      }),
    });
    if (!response.ok) throw new Error(`Outcome logging failed: ${response.status}`);
    return true;
  } catch (error) {
    console.error("Could not save the anonymous diagnosis outcome.", error);
    return false;
  }
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

// Anonymous one-tap tags feed the aggregate teacher dashboard.
export async function shareTags(sessionId, tagIds) {
  const response = await fetch("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, tags: tagIds }),
  });
  if (!response.ok) throw new Error(`Feedback could not be saved: ${response.status}`);
  return response.json();
}

export async function getTeacherSummary() {
  const response = await fetch("/api/teacher/summary", {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail || "Teacher dashboard could not load.");
  return payload;
}

export async function getTeacherReport(lang = "en") {
  const response = await fetch(`/api/teacher/report?lang=${encodeURIComponent(lang)}`, {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail || "Report could not be generated.");
  return payload;
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

export async function chatWithTutor({ topicId, language, messages }) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic_id: topicId, language, messages }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail || "The AI tutor could not respond.");
  return payload.text;
}

export async function getAIStatus() {
  const response = await fetch("/api/health", { cache: "no-store" });
  if (!response.ok) throw new Error("The AI service is unavailable.");
  return response.json();
}
