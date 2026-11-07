"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import { CHAIN, HTML_LANG, QUESTIONS, TOPICS, t } from "./_lib/data";
import { isCorrect } from "./_lib/speech";
import { getTopics, logAnswer } from "./_lib/api";
import { Header, topicName } from "./_components/ui";
import QuestionScreen from "./_components/QuestionScreen";
import MapScreen from "./_components/MapScreen";
import LessonScreen from "./_components/LessonScreen";
import LanguageGapScreen from "./_components/LanguageGapScreen";
import TeacherScreen from "./_components/TeacherScreen";

const freshStates = () => Object.fromEntries(CHAIN.map((id) => [id, "untested"]));
const LAST = CHAIN.length - 1;

export default function BisectPage() {
  const [courseLang, setCourseLang] = useState("en");
  const [myLang, setMyLang] = useState("en");
  const [startTopic, setStartTopic] = useState(CHAIN[0]);
  const [topicOptions, setTopicOptions] = useState(() => CHAIN.map((id) => ({ id, names: TOPICS[id] })));
  const [screen, setScreen] = useState("question"); // question | map | lesson | languageGap | teacher
  // phase: original (first question) | langcheck | diagnose | retest | langretry
  const [phase, setPhase] = useState("original");
  const [idx, setIdx] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [states, setStates] = useState(freshStates);
  const [root, setRoot] = useState(null);
  const [wrong, setWrong] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState({});
  const [explanations, setExplanations] = useState({});
  const [asked, setAsked] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [mapMode, setMapMode] = useState("diagnosed");
  const [nextTopic, setNextTopic] = useState(null);
  const [lessonTopic, setLessonTopic] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [sharedTags, setSharedTags] = useState([]);
  const [lastStudentScreen, setLastStudentScreen] = useState("question");

  const goTeacher = () => {
    setLastStudentScreen(screen);
    setScreen("teacher");
  };

  // Keep <html lang> in sync so screen readers pronounce the page correctly.
  useEffect(() => {
    const lang = screen === "teacher" ? courseLang : myLang;
    document.documentElement.lang = HTML_LANG[lang];
  }, [myLang, courseLang, screen]);

  useEffect(() => {
    let alive = true;
    getTopics().then((topics) => alive && setTopicOptions(topics));
    return () => {
      alive = false;
    };
  }, []);

  function restart(nextStartTopic = startTopic) {
    const nextStartIndex = Math.max(0, CHAIN.indexOf(nextStartTopic));
    setStartTopic(nextStartTopic);
    setScreen("question");
    setPhase("original");
    setIdx(nextStartIndex);
    setQIndex(0);
    setStates(freshStates());
    setRoot(null);
    setWrong({});
    setWrongQuestions({});
    setExplanations({});
    setAsked(0);
    setFixed(0);
    setMapMode("diagnosed");
    setNextTopic(null);
    setLessonTopic(null);
    setAttempt((a) => a + 1);
  }

  const setTopicState = (id, s) => setStates((prev) => ({ ...prev, [id]: s }));
  const ask = (p, i, q) => {
    setPhase(p);
    setIdx(i);
    setQIndex(q);
    setAttempt((a) => a + 1);
    setScreen("question");
  };
  const showMap = (mode) => {
    setMapMode(mode);
    setScreen("map");
  };

  const topicId = CHAIN[idx];
  const question = QUESTIONS[topicId][qIndex];
  const startIndex = Math.max(0, CHAIN.indexOf(startTopic));

  // Which language each question is shown in (the two-language model).
  let displayLang = myLang;
  if (phase === "original" || phase === "langretry") displayLang = courseLang;
  if (phase === "retest" && idx === 0) displayLang = courseLang; // final check in the exam language

  function handleAnswer({ value, mode, explanation, langShown }) {
    const correct = isCorrect(question, value);
    logAnswer({ questionId: question.id, topicId, mode, value, explanation, langShown, correct });
    setAsked((n) => n + 1);
    if (!correct && (qIndex === 0 || !wrong[topicId] || phase === "retest")) {
      setWrong((w) => ({ ...w, [topicId]: value }));
      setWrongQuestions((w) => ({ ...w, [topicId]: question }));
    }
    if (explanation) setExplanations((e) => ({ ...e, [topicId]: explanation }));

    if (phase === "original") {
      if (correct) {
        setTopicState(topicId, "mastered");
        return showMap("done");
      }
      setTopicState(topicId, "gap");
      // Different languages? First check whether it's the words, not the idea.
      if (myLang !== courseLang && langShown === courseLang) return ask("langcheck", startIndex, 1);
      if (startIndex === LAST) return ask("diagnose", startIndex, 1);
      return ask("diagnose", startIndex + 1, 0);
    }

    if (phase === "langcheck") {
      if (correct) return setScreen("languageGap");
      if (startIndex === LAST) {
        setRoot(startTopic);
        return showMap("diagnosed");
      }
      return ask("diagnose", startIndex + 1, 0);
    }

    if (phase === "diagnose") {
      if (correct) {
        if (idx === startIndex) {
          setTopicState(topicId, "mastered");
          setRoot(null);
          return showMap("done");
        }
        // Passed (first try or on the confirmation question): the gap is the topic above.
        setTopicState(topicId, "mastered");
        setRoot(CHAIN[idx - 1]);
        return showMap("diagnosed");
      }
      if (qIndex === 0) return ask("diagnose", idx, 1); // confirmation question before calling it a gap
      setTopicState(topicId, "gap");
      if (idx === LAST) {
        setRoot(topicId);
        return showMap("diagnosed");
      }
      return ask("diagnose", idx + 1, 0);
    }

    if (phase === "retest") {
      if (!correct) {
        setTopicState(topicId, "gap");
        setLessonTopic(topicId);
        setScreen("lesson");
        return;
      }
      setTopicState(topicId, "mastered");
      setFixed((f) => f + 1);
      if (idx === startIndex) return showMap("done");
      setNextTopic(CHAIN[idx - 1]);
      return showMap("climbing");
    }

    if (phase === "langretry") {
      if (correct) {
        setTopicState(topicId, "mastered");
        setFixed(1);
        return showMap("done");
      }
      if (startIndex === LAST) return ask("diagnose", startIndex, 1);
      return ask("diagnose", startIndex + 1, 0);
    }
  }

  function onMapPrimary() {
    if (mapMode === "diagnosed") {
      setLessonTopic(root);
      setScreen("lesson");
    } else if (mapMode === "climbing" && nextTopic) {
      ask("retest", CHAIN.indexOf(nextTopic), 1);
    }
  }

  const inDiagnosis = phase === "original" || phase === "langcheck" || phase === "diagnose";
  const progress = inDiagnosis && phase !== "original"
    ? { n: asked + 1, total: Math.max(CHAIN.length - startIndex + 1, asked + 1) }
    : null;
  let headline = null;
  if (phase === "original") headline = t("starting", myLang, { topic: topicName(startTopic, myLang) });
  if (phase === "retest" || phase === "langretry") headline = t("retesting", myLang, { topic: topicName(topicId, myLang) });

  const isTeacher = screen === "teacher";

  return (
    <div className="bx-app">
      <Header
        courseLang={courseLang}
        myLang={myLang}
        setCourseLang={setCourseLang}
        setMyLang={setMyLang}
        topicLabel={isTeacher ? null : topicName(startTopic, myLang)}
        isTeacher={isTeacher}
        topics={topicOptions}
        selectedTopic={startTopic}
        onTopicChange={restart}
      />

      {screen === "question" && (
        <QuestionScreen
          key={`${attempt}-${displayLang}`}
          question={question}
          topicId={topicId}
          displayLang={displayLang}
          courseLang={courseLang}
          myLang={myLang}
          progress={progress}
          headline={headline}
          isConfirm={phase === "diagnose" && qIndex === 1}
          isExamLanguage={displayLang === courseLang}
          onSubmit={handleAnswer}
        />
      )}

      {screen === "map" && (
        <MapScreen
          states={states}
          rootCause={root}
          startTopic={startTopic}
          lang={myLang}
          courseLang={courseLang}
          mode={mapMode}
          nextTopic={nextTopic}
          fixedCount={fixed}
          explanationNote={root ? explanations[root] : null}
          onPrimary={onMapPrimary}
          onTeacher={goTeacher}
          onTagsShared={(tags) => setSharedTags(tags)}
          onNextTopic={() => restart(CHAIN[(startIndex + 1) % CHAIN.length])}
        />
      )}

      {screen === "lesson" && lessonTopic && (
        <LessonScreen
          topicId={lessonTopic}
          wrongValue={wrong[lessonTopic]}
          explanation={explanations[lessonTopic]}
          question={wrongQuestions[lessonTopic] || QUESTIONS[lessonTopic][0]}
          lang={myLang}
          courseLang={courseLang}
          onRetest={() => ask("retest", CHAIN.indexOf(lessonTopic), 1)}
        />
      )}

      {screen === "languageGap" && (
        <LanguageGapScreen
          lang={myLang}
          courseLang={courseLang}
          onRetry={() => ask("langretry", 0, 0)}
          onTagsShared={(tags) => setSharedTags(tags)}
        />
      )}

      {screen === "teacher" && <TeacherScreen lang={courseLang} sharedTags={sharedTags} />}

      <nav className="bx-demo-bar" aria-label="Demo controls">
        <button type="button" onClick={() => (isTeacher ? setScreen(lastStudentScreen) : goTeacher())}>
          {isTeacher ? t("studentView", courseLang) : t("teacherView", myLang)}
        </button>
        <button type="button" onClick={restart}>{t("restart", myLang)}</button>
      </nav>
    </div>
  );
}
