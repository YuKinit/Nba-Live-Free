const NBA_ORIGIN = 'https://cdn.nba.com';

export async function onRequest(context) {
  try {
    const { request, params } = context;
    const parts = Array.isArray(params?.path) ? params.path : [];
    const upstreamPath = '/' + parts.map(encodeURIComponent).join('/');
    const url = new URL(request.url);
    const upstreamUrl = NBA_ORIGIN + upstreamPath + url.search;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        accept: request.headers.get('accept') || 'application/json',
        'user-agent': request.headers.get('user-agent') || 'cloudflare-pages-proxy',
      },
    });

    const headers = new Headers(upstreamRes.headers);
    headers.set(
      'Cache-Control',
      headers.get('cache-control') || 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'
    );
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers,
    });
  } catch {
    return Response.json({ error: 'nba_proxy_failed' }, { status: 502 });
  }
}

