import { proxyToBackend } from "../_lib/proxy";

export const runtime = "nodejs";
export const GET = (request) => proxyToBackend(request, "/health");
