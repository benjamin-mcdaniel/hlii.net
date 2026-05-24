// HLII Frontend API
//
// Read-only API for the public site. Lives on hlii.net/api/*.
// Static assets and the report PDFs are served by Cloudflare Pages from
// frontend/web. This worker only handles dynamic endpoints.

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  Vary: "Origin"
};

function corsOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  try {
    const url = new URL(origin);
    if (url.hostname === "hlii.net" || url.hostname === "www.hlii.net" || url.hostname.endsWith(".pages.dev")) {
      return origin;
    }
  } catch {}

  return null;
}

function json(request, body, status = 200) {
  const headers = new Headers(BASE_HEADERS);
  const allowOrigin = corsOrigin(request);
  if (allowOrigin) headers.set("Access-Control-Allow-Origin", allowOrigin);
  return new Response(JSON.stringify(body), { status, headers });
}

function methodNotAllowed(request) {
  return json(request, { error: "Method not allowed" }, 405);
}

async function handleReports(request, url) {
  const catalogUrl = new URL("/reports/index.json", url.origin);

  try {
    const response = await fetch(catalogUrl, {
      cf: { cacheTtl: 60, cacheEverything: true }
    });
    if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
    return json(request, await response.json());
  } catch (error) {
    return json(request, { updated_at: null, reports: [], error: error.message }, 502);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      if (request.method !== "GET") return methodNotAllowed(request);
      return json(request, {
        ok: true,
        service: "hlii-frontend-api",
        version: "0.1.0",
        time: new Date().toISOString()
      });
    }

    if (url.pathname === "/api/reports") {
      if (request.method !== "GET") return methodNotAllowed(request);
      return handleReports(request, url);
    }

    return json(request, { error: "Not found", path: url.pathname }, 404);
  }
};
