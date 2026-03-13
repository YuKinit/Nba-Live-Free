const STREAMS_LIST_URL = 'https://thetvapp.link/nbastreams';
const LIST_URL = 'https://thetvapp.link/nbastreams';

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

async function findGameUrl(away, home) {
  const res = await fetch(STREAMS_LIST_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) return null;
  const html = await res.text();

  // Format 1: Markdown-style [Text](https://thetvapp.link/nba/slug/id) (what server fetch often gets)
  const markdownRe = /\[([^\]]+)\]\((https:\/\/thetvapp\.link\/nba\/[^)]+\/\d+)\)/g;
  let m;
  while ((m = markdownRe.exec(html)) !== null) {
    const linkText = (m[1] || '').trim();
    const fullUrl = m[2];
    if (hasBothTeams(linkText, away, home)) return fullUrl;
  }

  // Format 2: HTML <a href="URL">text</a>
  const htmlRe = /href="(https:\/\/thetvapp\.link\/nba\/[^"]+\/\d+)">([\s\S]*?)<\/a>/gi;
  while ((m = htmlRe.exec(html)) !== null) {
    const fullUrl = m[1];
    const linkText = (m[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (hasBothTeams(linkText, away, home)) return fullUrl;
  }

  // Fallback: match by slug in any URL
  const aSlug = away.toLowerCase().replace(/\bla\b/g, 'los angeles').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const hSlug = home.toLowerCase().replace(/\bla\b/g, 'los angeles').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

  if (!away || !home) {
    return Response.redirect(LIST_URL, 302);
  }

  try {
    const gameUrl = await findGameUrl(away, home);
    if (gameUrl) {
      return Response.redirect(gameUrl, 302);
    }
  } catch (err) {
    console.warn('stream-go', err);
  }

  return Response.redirect(LIST_URL, 302);
}
