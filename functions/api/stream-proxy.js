const STREAMS_LIST_URL = 'https://thetvapp.link/nbastreams';

function normalize(t) {
  return (t || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function hasBothTeams(text, away, home) {
  const s = normalize(text);
  const a = normalize(away);
  const h = normalize(home);
  if (!a || !h) return false;
  const hasA = s.includes(a) || a.split(/\s+/).filter((w) => w.length > 1).every((w) => s.includes(w));
  const hasB = s.includes(h) || h.split(/\s+/).filter((w) => w.length > 1).every((w) => s.includes(w));
  return hasA && hasB;
}

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\bla\b/g, 'los angeles')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tryMatch(html, away, home) {
  let m;
  const markdownRe = /\[([^\]]+)\]\((https:\/\/thetvapp\.link\/nba\/[^)]+\/\d+)\)/g;
  while ((m = markdownRe.exec(html)) !== null) {
    const linkText = (m[1] || '').trim();
    if (hasBothTeams(linkText, away, home)) return m[2];
  }
  const htmlRe = /href="(https:\/\/thetvapp\.link\/nba\/[^"]+\/\d+)">([\s\S]*?)<\/a>/gi;
  while ((m = htmlRe.exec(html)) !== null) {
    const linkText = (m[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (hasBothTeams(linkText, away, home)) return m[1];
  }
  const aSlug = slugify(away);
  const hSlug = slugify(home);
  const urlRe = /https:\/\/thetvapp\.link\/nba\/([^/"'\s)]+)\/(\d+)/g;
  while ((m = urlRe.exec(html)) !== null) {
    const pathSlug = (m[1] || '').trim();
    if (pathSlug.includes(aSlug) && pathSlug.includes(hSlug)) return m[0];
  }
  return null;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const away = decodeURIComponent(url.searchParams.get('away') || '').trim();
  const home = decodeURIComponent(url.searchParams.get('home') || '').trim();
  const awayShort = decodeURIComponent(url.searchParams.get('awayShort') || '').trim();
  const homeShort = decodeURIComponent(url.searchParams.get('homeShort') || '').trim();

  if (!away || !home) {
    return Response.json({ url: null }, { status: 400 });
  }

  const headers = { 'Cache-Control': 'public, max-age=120' };

  try {
    const res = await fetch(STREAMS_LIST_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return Response.json({ url: null }, { status: 200 });

    const html = await res.text();

    let found = tryMatch(html, away, home);
    if (found) return Response.json({ url: found }, { headers });

    if (awayShort && homeShort) {
      found = tryMatch(html, awayShort, homeShort);
      if (found) return Response.json({ url: found }, { headers });
    }
  } catch (err) {
    console.warn('stream-proxy', err);
  }

  return Response.json({ url: null }, { status: 200 });
}
