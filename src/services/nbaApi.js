const NBA_BASE = import.meta.env.DEV ? '/nba-api' : 'https://cdn.nba.com';
const SCHEDULE_URL = `${NBA_BASE}/static/json/staticData/scheduleLeagueV2.json`;

const NBA_TEAM_ID_MIN = 1610612737;
const NBA_TEAM_ID_MAX = 1610612768;

function isNbaTeam(teamId) {
  const id = Number(teamId);
  return !Number.isNaN(id) && id >= NBA_TEAM_ID_MIN && id <= NBA_TEAM_ID_MAX;
}

function mapStatus(gameStatus) {
  const status = Number(gameStatus);
  if (status === 3) return 'FINAL';
  if (status === 2) return 'LIVE';
  return 'UPCOMING';
}

function buildWhereToWatch(broadcasters) {
  const out = [];
  const natl = broadcasters?.nationalBroadcasters ?? [];
  for (const b of natl) {
    out.push({
      name: b.broadcasterDisplay || b.broadcasterAbbreviation || 'TV',
      type: b.broadcasterMedia === 'tv' ? 'Cable / Streaming' : 'Streaming',
      freeTrial: false,
    });
  }
  if (out.length === 0) {
    out.push({ name: 'NBA League Pass', type: 'Subscription', freeTrial: true });
  }
  return out;
}

function transformGame(raw, gameId) {
  const home = raw.homeTeam || {};
  const away = raw.awayTeam || {};
  if (!isNbaTeam(home.teamId) || !isNbaTeam(away.teamId)) return null;
  const status = mapStatus(raw.gameStatus);
  const broadcasters = raw.broadcasters || {};
  const natl = broadcasters.nationalBroadcasters || [];
  const channel =
    natl.length > 0
      ? (natl[0].broadcasterDisplay || natl[0].broadcasterAbbreviation)
      : 'NBA TV';
  return {
    id: raw.gameId || gameId,
    homeTeam: home.teamName || 'TBD',
    awayTeam: away.teamName || 'TBD',
    homeScore: status !== 'UPCOMING' ? home.score ?? null : null,
    awayScore: status !== 'UPCOMING' ? away.score ?? null : null,
    status,
    startTimeUtc: raw.gameDateTimeUTC || raw.gameDateUTC || null,
    channel,
    whereToWatch: buildWhereToWatch(broadcasters),
    gameLabel: raw.gameLabel || '',
  };
}

function parseGameClock(clockStr) {
  if (!clockStr || typeof clockStr !== 'string') return null;
  const match = clockStr.match(/PT(?:(\d+)M)?(\d+)(?:\.\d+)?S/);
  if (!match) return null;
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseInt(match[2] || '0', 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function fetchBoxscore(gameId) {
  if (!gameId) return null;
  const url = `${NBA_BASE}/static/json/liveData/boxscore/boxscore_${gameId}.json`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const game = data?.game;
    if (!game) return null;
    const status = Number(game.gameStatus);
    const home = game.homeTeam || {};
    const away = game.awayTeam || {};
    const homePlayers = home.players || [];
    const awayPlayers = away.players || [];
    const period = game.period ?? 0;
    const gameClock = parseGameClock(game.gameClock);
    return {
      period,
      gameClock: gameClock || '0:00',
      homeScore: home.score ?? 0,
      awayScore: away.score ?? 0,
      gameStatus: status,
      homePlayers,
      awayPlayers,
    };
  } catch {
    return null;
  }
}

const SCOREBOARD_URL = `${NBA_BASE}/static/json/liveData/scoreboard/todaysScoreboard_00.json`;

export async function fetchTodaysScoreboard() {
  try {
    const res = await fetch(SCOREBOARD_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const games = data?.scoreboard?.games ?? [];
    return games.map((g) => ({
      gameId: String(g.gameId),
      awayTeam: {
        teamName: g.awayTeam?.teamCity + ' ' + (g.awayTeam?.teamName || ''),
        wins: g.awayTeam?.wins ?? 0,
        losses: g.awayTeam?.losses ?? 0,
      },
      homeTeam: {
        teamName: g.homeTeam?.teamCity + ' ' + (g.homeTeam?.teamName || ''),
        wins: g.homeTeam?.wins ?? 0,
        losses: g.homeTeam?.losses ?? 0,
      },
    }));
  } catch {
    return [];
  }
}

export async function fetchNbaSchedule() {
  const res = await fetch(SCHEDULE_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Schedule fetch failed: ${res.status}`);
  const data = await res.json();
  const gameDates = data?.leagueSchedule?.gameDates ?? [];
  const games = [];
  for (const day of gameDates) {
    for (const raw of day.games || []) {
      const game = transformGame(raw, raw.gameId);
      if (game && game.startTimeUtc) games.push(game);
    }
  }
  return games;
}
