// HLII Backend API
//
// Write-side API for ingestion from collector scripts. Lives on
// backend.hlii.net. Auth via X-Ingest-Token header matched against the
// INGEST_TOKEN secret (set with `wrangler secret put INGEST_TOKEN`).
//
// Endpoints:
//   GET  /health                      -> service ping
//   POST /ingest/bills                -> batch ingest legislative bills
//   POST /ingest/rulings              -> batch ingest court rulings
//   POST /ingest/reports              -> upload a published report PDF to R2

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

function checkToken(request, env) {
  const provided = request.headers.get("x-ingest-token");
  return Boolean(provided) && Boolean(env.INGEST_TOKEN) && provided === env.INGEST_TOKEN;
}

function invalidFilename(filename) {
  return (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    !filename.toLowerCase().endsWith(".pdf")
  );
}

async function handleBills(request) {
  const payload = await request.json().catch(() => null);
  if (!payload || !Array.isArray(payload.items)) {
    return json({ error: "Expected { items: [...] }" }, 400);
  }
  return json({ ok: true, accepted: payload.items.length });
}

async function handleRulings(request) {
  const payload = await request.json().catch(() => null);
  if (!payload || !Array.isArray(payload.items)) {
    return json({ error: "Expected { items: [...] }" }, 400);
  }
  return json({ ok: true, accepted: payload.items.length });
}

async function handleReportUpload(request, env) {
  const filename = request.headers.get("x-report-filename");
  if (!filename) {
    return json({ error: "Missing X-Report-Filename header" }, 400);
  }
  if (invalidFilename(filename)) {
    return json({ error: "X-Report-Filename must be a bare .pdf filename" }, 400);
  }
  if (!request.body) {
    return json({ error: "Missing request body" }, 400);
  }
  if (!env.REPORTS_BUCKET) {
    return json({ error: "REPORTS_BUCKET not bound" }, 503);
  }

  await env.REPORTS_BUCKET.put(filename, request.body, {
    httpMetadata: { contentType: "application/pdf" }
  });

  return json({ ok: true, stored: true, key: filename });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      if (request.method !== "GET") return methodNotAllowed();
      return json({
        ok: true,
        service: env.SERVICE || "hlii-backend-api",
        time: new Date().toISOString()
      });
    }

    if (!env.INGEST_TOKEN) {
      return json({ error: "INGEST_TOKEN not configured" }, 503);
    }
    if (!checkToken(request, env)) return unauthorized();

    if (url.pathname === "/ingest/bills") {
      if (request.method !== "POST") return methodNotAllowed();
      return handleBills(request);
    }
    if (url.pathname === "/ingest/rulings") {
      if (request.method !== "POST") return methodNotAllowed();
      return handleRulings(request);
    }
    if (url.pathname === "/ingest/reports") {
      if (request.method !== "POST") return methodNotAllowed();
      return handleReportUpload(request, env);
    }

    return json({ error: "Not found", path: url.pathname }, 404);
  }
};
