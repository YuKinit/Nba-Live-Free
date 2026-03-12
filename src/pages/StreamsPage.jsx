import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext.jsx';
import { formatTimePHT, formatDateLabelPHT, getDateStringPHT } from '../utils/time.js';
import { getTeamInfo } from '../data/teams.js';
import { colors } from '../theme.js';
import './StreamsPage.css';

const STREAMS_LIST_URL = 'https://thetvapp.link/nbastreams';

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStreamUrlFallback(game) {
  const homeSlug = slugify(game.homeTeam);
  const awaySlug = slugify(game.awayTeam);
  const gameId = game.id || '';
  return `https://thetvapp.link/nba/${homeSlug}-${awaySlug}/${gameId}`;
}

async function resolveGameStreamUrl(game) {
  const awaySlug = slugify(game.awayTeam);
  const homeSlug = slugify(game.homeTeam);
  try {
    const res = await fetch(STREAMS_LIST_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const re = /https:\/\/thetvapp\.link\/nba\/([^/"'\s]+)\/(\d+)/g;
    let match;
    while ((match = re.exec(html)) !== null) {
      const fullUrl = match[0];
      const pathSlug = match[1];
      if (pathSlug && pathSlug.includes(awaySlug) && pathSlug.includes(homeSlug)) {
        return fullUrl;
      }
    }
  } catch (e) {
    console.warn('resolveGameStreamUrl failed', e);
  }
  return null;
}

export function StreamsPage() {
  const navigate = useNavigate();
  const { games, loading, error, refetch } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);
  const [notAvailableGame, setNotAvailableGame] = useState(null);
  const [openingGameId, setOpeningGameId] = useState(null);

  const streamGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    const todayStr = getDateStringPHT(new Date().toISOString());
    const tomorrowStr = getDateStringPHT(new Date(Date.now() + 86400000).toISOString());
    const todaysGames = games.filter((g) => {
      if (!g.startTimeUtc) return false;
      return getDateStringPHT(g.startTimeUtc) === todayStr;
    });
    const liveToday = todaysGames.filter((g) => g.status === 'LIVE');
    if (liveToday.length > 0) {
      return [...liveToday].sort((a, b) => {
        const ta = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0;
        const tb = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0;
        return ta - tb;
      });
    }
    const upcomingToday = todaysGames.filter((g) => g.status === 'UPCOMING');
    if (upcomingToday.length > 0) {
      return [...upcomingToday].sort((a, b) => {
        const ta = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0;
        const tb = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0;
        return ta - tb;
      });
    }
    const upcomingTomorrow = games.filter((g) => {
      if (!g.startTimeUtc) return false;
      return getDateStringPHT(g.startTimeUtc) === tomorrowStr && g.status === 'UPCOMING';
    });
    return [...upcomingTomorrow].sort((a, b) => {
      const ta = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0;
      const tb = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0;
      return ta - tb;
    });
  }, [games]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleWatchPress = async (game) => {
    if (game.status !== 'LIVE') {
      setNotAvailableGame({
        awayTeam: game.awayTeam,
        homeTeam: game.homeTeam,
        timePHT: formatTimePHT(game.startTimeUtc),
      });
      return;
    }
    setOpeningGameId(game.id);
    const url = await resolveGameStreamUrl(game);
    setOpeningGameId(null);
    const finalUrl = url || buildStreamUrlFallback(game);
    navigate('/stream', { state: { url: finalUrl, title: `${game.awayTeam} @ ${game.homeTeam}` } });
  };

  return (
    <div className="page streams-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}20, transparent)`,
        }}
      />
      <div className="page-safe">
        <header className="streams-header">
          <h1 className="streams-title">NBA Live Streams</h1>
        </header>

        {loading ? (
          <div className="page-center">
            <div className="spinner" style={{ borderTopColor: colors.primary }} />
          </div>
        ) : error ? (
          <div className="page-center">
            <p className="error-text">{error}</p>
            <button type="button" className="retry-btn" onClick={refetch}>
              Retry
            </button>
          </div>
        ) : streamGames.length === 0 ? (
          <div className="page-center">
            <p className="empty-text">No games today or tomorrow.</p>
          </div>
        ) : (
          <div className="stream-list">
            {streamGames.map((game) => {
              const away = getTeamInfo(game.awayTeam);
              const home = getTeamInfo(game.homeTeam);
              const timePHT = formatTimePHT(game.startTimeUtc);
              const dateLabel = formatDateLabelPHT(game.startTimeUtc);
              const status = game.status;
              let statusLabel = 'Upcoming';
              let statusClass = 'status-upcoming';
              if (status === 'LIVE') {
                statusLabel = 'Live now';
                statusClass = 'status-live';
              } else if (status === 'FINAL') {
                statusLabel = 'Final';
                statusClass = 'status-final';
              }
              const opening = openingGameId === game.id;

              return (
                <div key={game.id} className="stream-item-card">
                  <div className="stream-item-header">
                    <span className="stream-time-badge">{timePHT ? `${timePHT} · PHT` : 'TBD'}</span>
                    <span className="stream-date-label">{dateLabel}</span>
                    <span className={`stream-status-badge ${statusClass}`}>{statusLabel}</span>
                  </div>
                  <div className="stream-matchup-row">
                    <div className="stream-team-block">
                      <div
                        className="stream-logo-wrapper"
                        style={{ backgroundColor: away.primary || colors.surfaceElevated }}
                      >
                        {away.logo ? (
                          <img src={away.logo} alt="" className="stream-logo-img" />
                        ) : (
                          <span className="stream-logo-text">{away.code}</span>
                        )}
                      </div>
                      <span className="stream-team-name">{game.awayTeam}</span>
                    </div>
                    <span className="stream-vs">@</span>
                    <div className="stream-team-block">
                      <div
                        className="stream-logo-wrapper"
                        style={{ backgroundColor: home.primary || colors.surfaceElevated }}
                      >
                        {home.logo ? (
                          <img src={home.logo} alt="" className="stream-logo-img" />
                        ) : (
                          <span className="stream-logo-text">{home.code}</span>
                        )}
                      </div>
                      <span className="stream-team-name">{game.homeTeam}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="stream-watch-button"
                    onClick={() => handleWatchPress(game)}
                    disabled={opening}
                  >
                    {opening ? (
                      <>
                        <span className="spinner spinner--small" style={{ borderTopColor: colors.background }} />
                        <span>Opening stream…</span>
                      </>
                    ) : (
                      <>
                        <span>Watch now</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notAvailableGame && (
        <div className="overlay">
          <button
            type="button"
            className="overlay-backdrop"
            onClick={() => setNotAvailableGame(null)}
            aria-label="Close"
          />
          <div className="overlay-card">
            <h3 className="overlay-title">Not yet available</h3>
            <p className="overlay-subtitle">
              Stream will be available once the game is live.
            </p>
            <p className="overlay-matchup">
              {notAvailableGame.awayTeam} @ {notAvailableGame.homeTeam}
            </p>
            {notAvailableGame.timePHT && (
              <p className="overlay-time">{notAvailableGame.timePHT} · PHT</p>
            )}
            <button
              type="button"
              className="overlay-button"
              onClick={() => setNotAvailableGame(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
