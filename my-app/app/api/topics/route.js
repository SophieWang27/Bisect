import { NextResponse } from "next/server";

//export const runtime = "nodejs";

export async function GET() {
  const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  try {
    const response = await fetch(`${backendUrl}/topics`, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "The topic service is unavailable." }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Could not connect to the topic service." }, { status: 502 });
  }
}
