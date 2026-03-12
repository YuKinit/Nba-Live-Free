import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard.jsx';
import { useSchedule } from '../context/ScheduleContext.jsx';
import { useActiveUsers } from '../context/ActiveUsersContext.jsx';
import { colors } from '../theme.js';
import { isTodayPHT } from '../utils/time.js';
import './HomePage.css';

const FILTER_ALL = 'all';
const FILTER_LIVE = 'live';
const FILTER_FINISHED = 'finished';

export function HomePage() {
  const navigate = useNavigate();
  const { games, loading, error, refetch, liveData } = useSchedule();
  const { activeCount } = useActiveUsers();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(FILTER_ALL);

  const todaysGames = useMemo(
    () => games.filter((g) => isTodayPHT(g.startTimeUtc)),
    [games]
  );

  const filteredGames = useMemo(() => {
    if (filter === FILTER_LIVE) return todaysGames.filter((g) => g.status === 'LIVE');
    if (filter === FILTER_FINISHED) return todaysGames.filter((g) => g.status === 'FINAL');
    return todaysGames;
  }, [todaysGames, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <div className="page home-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}28, transparent)`,
        }}
      />
      <div className="page-safe">
        <header className="home-header">
          <h1 className="home-title">NBA Games</h1>
          {activeCount != null && (
            <div className="home-active-badge">
              <span className="home-online-dot" />
              <span className="home-active-text">{activeCount} online</span>
            </div>
          )}
        </header>

        <h2 className="section-title">Today&apos;s games</h2>

        {!loading && !error && todaysGames.length > 0 && (
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip ${filter === FILTER_ALL ? 'filter-chip--active' : ''}`}
              onClick={() => setFilter(FILTER_ALL)}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-chip filter-chip--live ${filter === FILTER_LIVE ? 'filter-chip--active-live' : ''}`}
              onClick={() => setFilter(FILTER_LIVE)}
            >
              <span className="filter-live-dot" />
              Live
            </button>
            <button
              type="button"
              className={`filter-chip ${filter === FILTER_FINISHED ? 'filter-chip--active' : ''}`}
              onClick={() => setFilter(FILTER_FINISHED)}
            >
              Finished
            </button>
          </div>
        )}

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
        ) : todaysGames.length === 0 ? (
          <div className="page-empty">
            <p className="empty-text">No games today</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="page-empty">
            <p className="empty-text">
              {filter === FILTER_LIVE ? 'No live games right now' : 'No finished games yet'}
            </p>
          </div>
        ) : (
          <div className="game-list">
            {filteredGames.map((item) => {
              const live = liveData[item.id];
              const gameForDetail =
                live && item.status === 'LIVE'
                  ? { ...item, homeScore: live.homeScore, awayScore: live.awayScore }
                  : item;
              return (
                <GameCard
                  key={item.id}
                  game={item}
                  liveData={live}
                  onPress={() =>
                    navigate('/game/' + item.id, {
                      state: { game: gameForDetail, liveData: live || undefined },
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
