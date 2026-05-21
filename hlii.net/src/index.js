const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net https://static.cloudflareinsights.com",
    "style-src 'self' https://cdn.jsdelivr.net",
    "font-src 'self' https://cdn.jsdelivr.net data:",
    "img-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join("; "),
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "index, follow"
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return withSecurityHeaders(
        Response.json({
          ok: true,
          site: "HLII",
          version: "v1",
          updated_at: "2026-05-20"
        })
      );
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withSecurityHeaders(assetResponse);
  }
};
