// Cloudflare Pages Function — server-side proxy for Club Elo API
// Receives requests from the browser at /api/elo/{ClubName}
// Forwards to https://api.clubelo.com/{ClubName}
// Club Elo is free, no API key required

export async function onRequest(context) {
  const { request } = context;

  // Allow CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Extract the club path from the URL
  const url = new URL(request.url);
  const clubPath = url.pathname.replace(/^\/api\/elo/, "");
  const upstreamURL = `https://api.clubelo.com${clubPath}`;

  try {
    const upstream = await fetch(upstreamURL, {
      method: "GET",
      headers: {
        "Accept": "text/csv, */*",
      },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "text/csv",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, {
      status: 502,
      headers: { "Content-Type": "text/plain", ...corsHeaders() },
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
