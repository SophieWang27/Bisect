import { NextResponse } from "next/server";

export async function proxyToBackend(request, path) {
  const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const query = new URL(request.url).search;
  const headers = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  if (contentType) headers.set("Content-Type", contentType);
  if (authorization) headers.set("Authorization", authorization);

  try {
    const response = await fetch(`${backendUrl}${path}${query}`, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Could not connect to the BISECT backend." }, { status: 502 });
  }
}
