"use client";

import { useEffect, useRef, useState } from "react";
import { chatWithTutor, getAIStatus } from "../_lib/api";
import { Send } from "./Icons";

const COPY = {
  en: {
    button: "Ask BISECT AI",
    title: "BISECT AI tutor",
    subtitle: "Ask a question about what you are learning.",
    welcome: "Hi! I can explain this topic, give you a hint, or work through an example with you.",
    suggestion: "Explain this topic simply",
    placeholder: "Ask your question…",
    send: "Send",
    close: "Close chat",
    thinking: "Thinking…",
    missingKey: "Gemini key missing · Add GEMINI_API_KEY to my-app/.env",
    connected: "Connected",
    offline: "AI service is offline",
    checking: "Checking AI connection…",
  },
  fr: {
    button: "Demander à BISECT AI",
    title: "Tuteur IA BISECT",
    subtitle: "Posez une question sur ce que vous apprenez.",
    welcome: "Bonjour ! Je peux expliquer ce sujet, donner un indice ou résoudre un exemple avec vous.",
    suggestion: "Explique ce sujet simplement",
    placeholder: "Posez votre question…",
    send: "Envoyer",
    close: "Fermer le chat",
    thinking: "Réflexion…",
    missingKey: "Clé Gemini manquante · Ajoutez GEMINI_API_KEY à my-app/.env",
    connected: "Connecté",
    offline: "Service IA hors ligne",
    checking: "Vérification de la connexion IA…",
  },
  zh: {
    button: "询问 BISECT AI",
    title: "BISECT AI 导师",
    subtitle: "询问正在学习的内容。",
    welcome: "你好！我可以解释这个主题、提供提示，或和你一起分析例题。",
    suggestion: "简单解释这个主题",
    placeholder: "输入问题…",
    send: "发送",
    close: "关闭聊天",
    thinking: "思考中…",
    missingKey: "缺少 Gemini 密钥 · 请将 GEMINI_API_KEY 添加到 my-app/.env",
    connected: "已连接",
    offline: "AI 服务未运行",
    checking: "正在检查 AI 连接…",
  },
};

export default function Chatbot({ topicId, topic, language = "en" }) {
  const copy = COPY[language] || COPY.en;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiStatus, setAiStatus] = useState(undefined);
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    getAIStatus()
      .then((status) => { if (active) setAiStatus(status); })
      .catch(() => { if (active) setAiStatus(null); });
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (open && transcriptRef.current) {
      transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, busy, error]);

  async function send(text = draft) {
    const content = text.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user", content }].slice(-12);
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setBusy(true);
    try {
      const reply = await chatWithTutor({ topicId, language, messages: nextMessages });
      setMessages([...nextMessages, { role: "model", content: reply }].slice(-12));
    } catch (requestError) {
      setError(requestError.message || "The AI tutor could not respond. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bx-chatbot">
      {open && (
        <section className="bx-chat-panel" aria-label={copy.title}>
          <header className="bx-chat-header">
            <div>
              <h2>{copy.title}</h2>
              <p>{aiStatus === undefined ? copy.checking : aiStatus?.gemini_configured ? `${copy.connected} · ${aiStatus.model}` : aiStatus ? copy.missingKey : copy.offline}</p>
            </div>
            <button type="button" className="bx-chat-close" onClick={() => setOpen(false)} aria-label={copy.close}>×</button>
          </header>
          <p className="bx-chat-subtitle">{copy.subtitle}</p>
          <div className="bx-chat-transcript" ref={transcriptRef} aria-live="polite">
            <p className="bx-chat-bubble is-model">{copy.welcome}</p>
            {messages.map((message, index) => (
              <p className={`bx-chat-bubble ${message.role === "user" ? "is-user" : "is-model"}`} key={`${index}-${message.role}`}>
                {message.content}
              </p>
            ))}
            {busy && <p className="bx-chat-bubble is-model" role="status">{copy.thinking}</p>}
          </div>
          {messages.length === 0 && (
            <button type="button" className="bx-chat-suggestion" onClick={() => send(`Explain ${topic} simply, with one short example.`)}>
              {copy.suggestion}
            </button>
          )}
          {error && <p className="bx-chat-error" role="alert">{error}</p>}
          <form className="bx-chat-form" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <input
              className="bx-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              maxLength={1500}
              disabled={busy}
            />
            <button type="submit" className="bx-chat-send" aria-label={copy.send} disabled={!draft.trim() || busy}>
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        className={`bx-chat-launch ${open ? "is-open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {open ? "×" : "✦"} <span>{open ? copy.close : copy.button}</span>
      </button>
    </div>
  );
}
