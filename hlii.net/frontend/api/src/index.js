// HLII Frontend API
//
// Read-only API for the public site. Lives on hlii.net/api/*.
// Static assets and the report PDFs are served by Cloudflare Pages from
// frontend/web. This worker only handles dynamic endpoints.

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60",
  "Access-Control-Allow-Origin": "https://hlii.net",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "hlii-frontend-api",
        version: "0.1.0",
        time: new Date().toISOString()
      });
    }

    if (url.pathname === "/api/reports") {
      // Public list of reports. The authoritative catalog is the static
      // /reports/index.json file shipped with the site; we proxy it here so
      // downstream clients can hit a stable API path. Falls back to an empty
      // list if the static asset isn't reachable.
      try {
        const response = await fetch("https://hlii.net/reports/index.json", {
          cf: { cacheTtl: 60, cacheEverything: true }
        });
        if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
        const data = await response.json();
        return json(data);
      } catch (error) {
        return json({ updated_at: null, reports: [], error: error.message }, 502);
      }
    }

    return json({ error: "Not found", path: url.pathname }, 404);
  }
};
