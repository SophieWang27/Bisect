"use client";
import { useEffect, useRef, useState } from "react";
import { CHAIN, HTML_LANG, t } from "../_lib/data";
import { StatusPill, topicName } from "./ui";
import { Arrow } from "./Icons";
import TagsPanel from "./TagsPanel";

// mode: "diagnosed" (root found) | "climbing" (retesting upward) | "done" (all fixed)
export default function MapScreen({ states, rootCause, startTopic = CHAIN[0], lang, courseLang, mode, nextTopic, fixedCount, explanationNote, onPrimary, onTeacher, onTagsShared, onNextTopic }) {
  const [view, setView] = useState("map");
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  const start = startTopic;
  const nodes = CHAIN.map((id) => ({ id, status: states[id] || "untested", isRoot: id === rootCause && mode !== "done" }));

  let headline;
  if (mode === "done" && !fixedCount) headline = t("alreadyMastered", lang, { topic: topicName(start, lang) });
  else if (mode === "done") headline = t("fixedAll", lang, { n: fixedCount, topic: topicName(start, lang) });
  else if (rootCause === start) headline = t("gapIs", lang, { root: topicName(rootCause, lang) });
  else headline = t("gapIsnt", lang, { start: topicName(start, lang), root: topicName(rootCause, lang) });

  let primaryLabel = t("startLesson", lang);
  if (mode === "climbing" && nextTopic) primaryLabel = t("continueRetest", lang, { topic: topicName(nextTopic, lang) });

  return (
    <main className="bx-main bx-wide">
      <section className="bx-card bx-map-card" aria-labelledby="map-title">
        <div className="bx-row-between">
          <h1 id="map-title" ref={headingRef} tabIndex={-1} className="bx-h2">
            {t("topicMap", lang)}
          </h1>
          <div className="bx-seg" role="group" aria-label={`${t("mapView", lang)} / ${t("listView", lang)}`}>
            <button type="button" aria-pressed={view === "map"} className={view === "map" ? "is-active" : ""} onClick={() => setView("map")}>
              {t("mapView", lang)}
            </button>
            <button type="button" aria-pressed={view === "list"} className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}>
              {t("listView", lang)}
            </button>
          </div>
        </div>

        {view === "map" ? (
          <div className="bx-map-stage">
            {nodes.map((n, i) => (
              <div key={n.id} className="bx-node-wrap">
                {i > 0 && <div className="bx-connector" aria-hidden="true" />}
                <div className={`bx-node is-${n.status} ${n.isRoot ? "is-root" : ""}`}>
                  {n.isRoot && <span className="bx-root-tag">{t("rootCause", lang)}</span>}
                  <div className="bx-node-text">
                    <span className="bx-node-name" lang={HTML_LANG[lang]}>{topicName(n.id, lang)}</span>
                    {lang !== courseLang && (
                      <span className="bx-node-sub" lang={HTML_LANG[courseLang]}>{topicName(n.id, courseLang)}</span>
                    )}
                  </div>
                  <StatusPill status={n.status} lang={lang} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ol className="bx-map-list">
            {nodes.map((n) => (
              <li key={n.id}>
                <strong>{topicName(n.id, lang)}</strong> — {t(n.status, lang)}
                {n.isRoot ? ` (${t("rootCause", lang)})` : ""}
              </li>
            ))}
          </ol>
        )}

        <div className="bx-legend">
          <span><i className="bx-swatch is-mastered" aria-hidden="true" />{t("mastered", lang)}</span>
          <span><i className="bx-swatch is-gap" aria-hidden="true" />{t("gap", lang)}</span>
          <span><i className="bx-swatch is-untested" aria-hidden="true" />{t("untested", lang)}</span>
        </div>
      </section>

      <aside className="bx-side">
        <section className="bx-card bx-stack-14" aria-live="polite">
          <p className="bx-label bx-muted">{t("diagnosis", lang)}</p>
          <p className="bx-headline">{headline}</p>
          {explanationNote && mode === "diagnosed" && <p className="bx-muted">“{explanationNote}”</p>}
          {mode !== "done" ? (
            <button type="button" className="bx-btn bx-btn-primary bx-btn-lg" onClick={onPrimary}>
              {primaryLabel} <Arrow />
            </button>
          ) : (
            <div className="bx-row-wrap">
              <button type="button" className="bx-btn bx-btn-dark bx-btn-lg" onClick={onTeacher}>
                {t("teacherView", lang)} <Arrow />
              </button>
              <button type="button" className="bx-btn bx-btn-primary bx-btn-lg" onClick={onNextTopic}>
                {t("nextTopic", lang)} <Arrow />
              </button>
            </div>
          )}
        </section>
        {mode !== "done" ? (
          <section className="bx-card bx-stack-8">
            <p className="bx-muted">{t("climbHint", lang)}</p>
          </section>
        ) : (
          <TagsPanel lang={lang} onShared={onTagsShared} />
        )}
      </aside>
    </main>
  );
}
