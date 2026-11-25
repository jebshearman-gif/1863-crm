// Cloudflare Pages Function — server-side proxy for API-Football v3
// Receives requests from the browser at /api/football/...
// Forwards to https://v3.football.api-sports.io/... with the API key
// The key is passed from the browser as the X-AF-Key header (never stored server-side)

export async function onRequest(context) {
  const { request } = context;

  // Allow CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Extract the API key the browser forwarded
  const afKey = request.headers.get("x-af-key");
  if (!afKey) {
    return new Response(JSON.stringify({ error: "Missing x-af-key header" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  // Build the upstream URL: replace /api/football with the real API base
  const url = new URL(request.url);
  const upstreamPath = url.pathname.replace(/^\/api\/football/, "");
  const upstreamURL = `https://v3.football.api-sports.io${upstreamPath}${url.search}`;

  try {
    const upstream = await fetch(upstreamURL, {
      method: request.method,
      headers: {
        "x-apisports-key": afKey,
        "Accept": "application/json",
      },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "x-af-key, Content-Type",
  };
}
