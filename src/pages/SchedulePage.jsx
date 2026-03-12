import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleGameCard } from '../components/ScheduleGameCard.jsx';
import { useSchedule } from '../context/ScheduleContext.jsx';
import { colors } from '../theme.js';
import './SchedulePage.css';

export function SchedulePage() {
  const navigate = useNavigate();
  const { games, loading, error, refetch, hasPlayoffGames } = useSchedule();
  const listRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const upcomingGames = useMemo(() => {
    const now = Date.now();
    return games
      .filter((g) => {
        if (!g.startTimeUtc) return false;
        const t = new Date(g.startTimeUtc).getTime();
        if (Number.isNaN(t)) return false;
        return t >= now && g.status === 'UPCOMING';
      })
      .sort((a, b) => {
        const ta = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0;
        const tb = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0;
        return ta - tb;
      });
  }, [games]);

  const onScroll = useCallback((e) => {
    setShowScrollTop(e.target.scrollTop > 200);
  }, []);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <div className="page schedule-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}18, transparent)`,
        }}
      />
      <div className="page-safe">
        <header className="schedule-header">
          <h1 className="schedule-title">Schedule</h1>
          <p className="schedule-subtitle">All upcoming games</p>
        </header>

        <button
          type="button"
          className={`playoff-note ${hasPlayoffGames ? 'playoff-note--clickable' : ''}`}
          onClick={hasPlayoffGames ? () => navigate('/playoff-bracket') : undefined}
          disabled={!hasPlayoffGames}
        >
          <span className="playoff-icon" aria-hidden>🏆</span>
          <span className="playoff-text">
            {hasPlayoffGames
              ? 'Tap to view playoff bracket (tree).'
              : 'Playoff bracket (tree) will be available when the NBA playoffs begin.'}
          </span>
          {hasPlayoffGames && <span aria-hidden>→</span>}
        </button>

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
        ) : (
          <>
            <div
              ref={listRef}
              className="schedule-list"
              onScroll={onScroll}
            >
              {upcomingGames.map((item) => (
                <ScheduleGameCard
                  key={item.id}
                  game={item}
                  onPress={(game) => navigate('/team-leaders/' + item.id, { state: { game } })}
                />
              ))}
            </div>
            {showScrollTop && (
              <button
                type="button"
                className="scroll-top-btn"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                ↑
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
