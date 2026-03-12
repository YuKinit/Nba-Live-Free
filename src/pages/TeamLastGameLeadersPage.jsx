import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext.jsx';
import { getTeamInfo } from '../data/teams.js';
import { formatTimePHT } from '../utils/time.js';
import { fetchBoxscore } from '../services/nbaApi.js';
import { colors } from '../theme.js';
import './TeamLastGameLeadersPage.css';

export function TeamLastGameLeadersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateGame = location.state?.game;
  const { games } = useSchedule();
  const game = stateGame || games.find((g) => String(g.id) === String(id)) || {};

  const [leaders, setLeaders] = useState({ home: null, away: null });
  const [loading, setLoading] = useState(true);

  const targetHome = getTeamInfo(game.homeTeam);
  const targetAway = getTeamInfo(game.awayTeam);
  const timePHT = formatTimePHT(game.startTimeUtc);

  const lastFinishedGames = useMemo(() => {
    const result = { home: null, away: null };
    if (!games?.length || !game?.homeTeam) return result;
    const gameTime = game.startTimeUtc ? new Date(game.startTimeUtc).getTime() : Date.now();
    const isFinishedBefore = (g, teamName) => {
      if (g.status !== 'FINAL') return false;
      const t = g.startTimeUtc ? new Date(g.startTimeUtc).getTime() : 0;
      if (!t || t >= gameTime) return false;
      return g.homeTeam === teamName || g.awayTeam === teamName;
    };
    const finished = games.filter((g) => g.status === 'FINAL');
    const findLast = (teamName) =>
      finished
        .filter((g) => isFinishedBefore(g, teamName))
        .sort((a, b) => {
          const ta = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0;
          const tb = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0;
          return tb - ta;
        })[0] || null;
    result.home = findLast(game.homeTeam);
    result.away = findLast(game.awayTeam);
    return result;
  }, [games, game]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const next = { home: null, away: null };
      const mapPlayer = (p) => {
        const stats = p.statistics || {};
        return {
          id: String(p.personId || p.jerseyNum || Math.random()),
          name: p.name || p.familyName || 'Player',
          points: stats.points ?? 0,
          rebounds: stats.reboundsTotal ?? stats.rebounds ?? 0,
          assists: stats.assists ?? 0,
          personId: p.personId,
        };
      };
      const pickTop = (list) =>
        list.map(mapPlayer).sort((a, b) => b.points - a.points)[0] || null;

      const loadLeader = async (side, lastGame) => {
        if (!lastGame?.id) return;
        const box = await fetchBoxscore(lastGame.id);
        if (!box) return;
        const homePlayers = Array.isArray(box.homePlayers) ? box.homePlayers : [];
        const awayPlayers = Array.isArray(box.awayPlayers) ? box.awayPlayers : [];
        const isHomeTarget = lastGame.homeTeam === (side === 'home' ? game.homeTeam : game.awayTeam);
        const players = isHomeTarget ? homePlayers : awayPlayers;
        const top = pickTop(players);
        if (top) next[side] = { teamName: side === 'home' ? game.homeTeam : game.awayTeam, leader: top };
      };

      await Promise.all([
        loadLeader('home', lastFinishedGames.home),
        loadLeader('away', lastFinishedGames.away),
      ]);
      if (!mounted) return;
      setLeaders(next);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [game, lastFinishedGames]);

  const headshotUrl = (personId) =>
    personId ? `https://cdn.nba.com/headshots/nba/latest/260x190/${personId}.png` : null;

  return (
    <div className="page team-leaders-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}30, var(--background))`,
        }}
      />
      <div className="page-safe">
        <header className="team-leaders-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </header>
        <div className="team-leaders-scroll">
          <div className="team-leaders-content">
            <div className="team-leaders-hero">
              <div className="team-leaders-hero-gradient">
                <div className="team-leaders-hero-teams">
                  <div className="team-leaders-hero-team">
                    <div
                      className="team-leaders-hero-logo"
                      style={{ backgroundColor: targetAway.primary || colors.surfaceElevated }}
                    >
                      {targetAway.logo ? (
                        <img src={targetAway.logo} alt="" className="team-leaders-hero-logo-img" />
                      ) : (
                        <span className="team-leaders-hero-logo-text">{targetAway.code}</span>
                      )}
                    </div>
                    <span className="team-leaders-hero-name">{game.awayTeam}</span>
                  </div>
                  <span className="team-leaders-hero-vs">vs</span>
                  <div className="team-leaders-hero-team">
                    <div
                      className="team-leaders-hero-logo"
                      style={{ backgroundColor: targetHome.primary || colors.surfaceElevated }}
                    >
                      {targetHome.logo ? (
                        <img src={targetHome.logo} alt="" className="team-leaders-hero-logo-img" />
                      ) : (
                        <span className="team-leaders-hero-logo-text">{targetHome.code}</span>
                      )}
                    </div>
                    <span className="team-leaders-hero-name">{game.homeTeam}</span>
                  </div>
                </div>
                <p className="team-leaders-hero-meta">{timePHT ? `${timePHT} · PHT` : ''}</p>
              </div>
            </div>

            {loading ? (
              <div className="page-center">
                <div className="spinner" style={{ borderTopColor: colors.primary }} />
              </div>
            ) : (
              <div className="team-leaders-cards">
                {[
                  { side: 'home', team: targetHome },
                  { side: 'away', team: targetAway },
                ].map((entry) => {
                  const info = leaders[entry.side];
                  const leader = info?.leader;
                  if (!leader) {
                    return (
                      <div key={entry.side} className="team-leader-card">
                        <div className="team-leader-row">
                          <div
                            className="team-leader-logo"
                            style={{ backgroundColor: entry.team?.primary || colors.surfaceElevated }}
                          >
                            {entry.team?.logo ? (
                              <img src={entry.team.logo} alt="" className="team-leader-logo-img" />
                            ) : (
                              <span className="team-leader-logo-text">{entry.team?.code}</span>
                            )}
                          </div>
                          <span className="team-leader-name">{info?.teamName || entry.team?.name}</span>
                        </div>
                        <p className="team-leader-no-data">No previous game data.</p>
                      </div>
                    );
                  }
                  return (
                    <div key={entry.side} className="team-leader-card">
                      <div className="team-leader-row">
                        <div
                          className="team-leader-logo"
                          style={{ backgroundColor: entry.team?.primary || colors.surfaceElevated }}
                        >
                          {entry.team?.logo ? (
                            <img src={entry.team.logo} alt="" className="team-leader-logo-img" />
                          ) : (
                            <span className="team-leader-logo-text">{entry.team?.code}</span>
                          )}
                        </div>
                        <span className="team-leader-name">{info.teamName || entry.team?.name}</span>
                      </div>
                      <div className="leader-row">
                        <div className="leader-left">
                          <div className="leader-avatar">
                            {headshotUrl(leader.personId) ? (
                              <img src={headshotUrl(leader.personId)} alt="" className="leader-avatar-img" />
                            ) : (
                              <span className="leader-avatar-text">
                                {leader.name.split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="leader-name">{leader.name}</span>
                            <p className="leader-sub">Last game top scorer</p>
                          </div>
                        </div>
                        <div className="leader-stats">
                          <div className="leader-stat-col">
                            <span className="leader-stat-label">PTS</span>
                            <span className="leader-stat-value">{leader.points}</span>
                          </div>
                          <div className="leader-stat-col">
                            <span className="leader-stat-label">REB</span>
                            <span className="leader-stat-value">{leader.rebounds}</span>
                          </div>
                          <div className="leader-stat-col">
                            <span className="leader-stat-label">AST</span>
                            <span className="leader-stat-value">{leader.assists}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
