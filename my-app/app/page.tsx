import { useState } from "react";

export default function Page() {
  const [lesson, setLesson] = useState<{ explanation: string } | null>(null);

  async function load() {
    const res = await fetch("/api/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Binary place value" }),
    });
    setLesson(await res.json());
  }

  return (
    <main>
      <button onClick={load}>Get lesson</button>
      {lesson && <p>{lesson.explanation}</p>}
    </main>
  );
}

