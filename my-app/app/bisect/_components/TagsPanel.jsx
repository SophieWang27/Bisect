"use client";
import { useState } from "react";
import { TAGS, t } from "../_lib/data";
import { shareTags } from "../_lib/api";

// Anonymous one-tap tags. No free text, no names: they only show up as class trends.
export default function TagsPanel({ lang, onShared }) {
  const [picked, setPicked] = useState([]);
  const [sent, setSent] = useState(false);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function send() {
    if (!picked.length) return;
    await shareTags(picked);
    setSent(true);
    if (onShared) onShared(picked);
  }

  return (
    <section className="bx-card bx-stack-14">
      <h2 className="bx-h3">{t("slowingDown", lang)}</h2>
      <p className="bx-muted bx-small">{t("slowingHint", lang)}</p>
      <div className="bx-tags" role="group" aria-label={t("slowingDown", lang)}>
        {TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`bx-tag ${picked.includes(tag.id) ? "is-active" : ""}`}
            aria-pressed={picked.includes(tag.id)}
            onClick={() => toggle(tag.id)}
            disabled={sent}
          >
            {tag[lang] || tag.en}
          </button>
        ))}
      </div>
      {sent ? (
        <p className="bx-pill bx-pill-mastered" role="status">✓ {t("shared", lang)}</p>
      ) : (
        <button type="button" className="bx-btn bx-btn-dark" onClick={send} disabled={!picked.length}>
          {t("shareAnon", lang)}
        </button>
      )}
    </section>
  );
}
