export const config = {
  runtime: 'nodejs',
};

const NBA_ORIGIN = 'https://cdn.nba.com';

export default async function handler(req, res) {
  try {
    const { path = [] } = req.query || {};
    const parts = Array.isArray(path) ? path : [path];
    const upstreamPath = '/' + parts.map(encodeURIComponent).join('/');
    const upstreamUrl = NBA_ORIGIN + upstreamPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        accept: req.headers.accept || 'application/json',
        'user-agent': req.headers['user-agent'] || 'vercel-proxy',
      },
    });

    const contentType = upstreamRes.headers.get('content-type') || 'application/json; charset=utf-8';
    const cacheControl =
      upstreamRes.headers.get('cache-control') ||
      // CDN JSON is safe to cache briefly; keep it snappy while reducing load.
      'public, s-maxage=300, stale-while-revalidate=3600';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    // Allow the browser to call our API from the same origin (your Vercel domain).
    res.setHeader('Access-Control-Allow-Origin', '*');

    const body = Buffer.from(await upstreamRes.arrayBuffer());
    res.status(upstreamRes.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'nba_proxy_failed' });
  }
}

