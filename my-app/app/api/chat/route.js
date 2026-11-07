import { proxyToBackend } from "../_lib/proxy";

//export const runtime = "nodejs";
export const POST = (request) => proxyToBackend(request, "/chat");
