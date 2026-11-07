'use client';
import { useState } from "react";

export default function Page() {
  const [topic, setTopic] = useState("Two's complement");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setText("");
  
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => setText(data.text))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ width: "70%", padding: 8 }}
      />
      <button onClick={load} disabled={loading} style={{ padding: 8, marginLeft: 8 }}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
    </main>
  );
}

