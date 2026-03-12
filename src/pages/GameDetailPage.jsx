import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext.jsx';
import { getTeamInfo } from '../data/teams.js';
import { formatTimePHT } from '../utils/time.js';
import { fetchBoxscore, fetchTodaysScoreboard } from '../services/nbaApi.js';
import { colors } from '../theme.js';
import './GameDetailPage.css';

export function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { games } = useSchedule();
  const { game: routeGame, liveData: routeLiveData } = location.state || {};
  const gameFromContext = games.find((g) => String(g.id) === String(id));
  const game = routeGame || gameFromContext || { id, homeTeam: 'TBD', awayTeam: 'TBD', status: 'UPCOMING' };

  const isLive = game.status === 'LIVE';
  const isFinal = game.status === 'FINAL';
  const hasScore = isLive || isFinal;
  const away = getTeamInfo(game.awayTeam);
  const home = getTeamInfo(game.homeTeam);
  const timePHT = formatTimePHT(game.startTimeUtc);
  const liveMeta =
    isLive && routeLiveData && routeLiveData.period != null && routeLiveData.gameClock != null
      ? `Q${routeLiveData.period} ${routeLiveData.gameClock}`
      : null;

  const [boxPlayers, setBoxPlayers] = useState({ home: [], away: [] });
  const [standings, setStandings] = useState({ away: null, home: null });

  useEffect(() => {
    let mounted = true;
    async function loadBox() {
      if (!isFinal || !game.id) return;
      const box = await fetchBoxscore(game.id);
      if (!mounted || !box) return;
      const homePlayers = Array.isArray(box.homePlayers) ? box.homePlayers : [];
      const awayPlayers = Array.isArray(box.awayPlayers) ? box.awayPlayers : [];
      setBoxPlayers({ home: homePlayers, away: awayPlayers });
    }
    loadBox();
    return () => { mounted = false; };
  }, [isFinal, game.id]);

  useEffect(() => {
    let mounted = true;
    async function loadStandings() {
      if (!hasScore || !game.id) return;
      const scoreboard = await fetchTodaysScoreboard();
      if (!mounted) return;
      const match = scoreboard.find((g) => String(g.gameId) === String(game.id));
      if (match) {
        setStandings({
          away: { wins: match.awayTeam.wins, losses: match.awayTeam.losses },
          home: { wins: match.homeTeam.wins, losses: match.homeTeam.losses },
        });
      }
    }
    loadStandings();
    return () => { mounted = false; };
  }, [hasScore, game.id]);

  const sortedPlayers = useMemo(() => {
    if (!isFinal) return { first: [], second: [] };
    const homeScore = game.homeScore ?? 0;
    const awayScore = game.awayScore ?? 0;
    const homeFirst = homeScore >= awayScore;
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
    const homeMapped = boxPlayers.home.map(mapPlayer).sort((a, b) => b.points - a.points);
    const awayMapped = boxPlayers.away.map(mapPlayer).sort((a, b) => b.points - a.points);
    return homeFirst
      ? { first: { team: home, name: game.homeTeam, players: homeMapped }, second: { team: away, name: game.awayTeam, players: awayMapped } }
      : { first: { team: away, name: game.awayTeam, players: awayMapped }, second: { team: home, name: game.homeTeam, players: homeMapped } };
  }, [isFinal, game.homeScore, game.awayScore, boxPlayers, home, away, game.homeTeam, game.awayTeam]);

  const headshotUrl = (personId) =>
    personId ? `https://cdn.nba.com/headshots/nba/latest/260x190/${personId}.png` : null;

  return (
    <div className="page game-detail-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}35, ${colors.background})`,
        }}
      />
      <div className="page-safe">
        <header className="game-detail-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </header>

        <div className="game-detail-scroll">
          <div className="game-detail-content">
            <div className="hero-card">
              <div
                className="hero-gradient"
                style={{
                  background: isLive
                    ? `linear-gradient(135deg, ${colors.live}40, ${colors.live}15)`
                    : `linear-gradient(135deg, ${colors.primary}25, ${colors.primary}08)`,
                }}
              >
                {isLive && (
                  <div className="live-badge">
                    <span className="live-pulse" />
                    LIVE
                  </div>
                )}
                {isFinal && <span className="final-badge">FINAL</span>}
                <div className="hero-teams-row">
                  <div className="hero-team">
                    <div
                      className="hero-logo-wrapper"
                      style={{ backgroundColor: away.primary || colors.surfaceElevated }}
                    >
                      {away.logo ? (
                        <img src={away.logo} alt="" className="hero-logo-img" />
                      ) : (
                        <span className="hero-logo-text">{away.code}</span>
                      )}
                    </div>
                    <span className="hero-team-name">{game.awayTeam}</span>
                  </div>
                  <span className="hero-vs">vs</span>
                  <div className="hero-team">
                    <div
                      className="hero-logo-wrapper"
                      style={{ backgroundColor: home.primary || colors.surfaceElevated }}
                    >
                      {home.logo ? (
                        <img src={home.logo} alt="" className="hero-logo-img" />
                      ) : (
                        <span className="hero-logo-text">{home.code}</span>
                      )}
                    </div>
                    <span className="hero-team-name">{game.homeTeam}</span>
                  </div>
                </div>
                {hasScore && (
                  <div className="score-row">
                    <span className="score-big">{game.awayScore ?? '–'}</span>
                    <span className="score-divider">–</span>
                    <span className="score-big">{game.homeScore ?? '–'}</span>
                  </div>
                )}
                {(standings.away || standings.home) && (
                  <div className="standings-row">
                    <span className="standings-text">
                      {standings.away ? `${standings.away.wins}-${standings.away.losses}` : '–'}
                    </span>
                    <span className="standings-label">Standings</span>
                    <span className="standings-text">
                      {standings.home ? `${standings.home.wins}-${standings.home.losses}` : '–'}
                    </span>
                  </div>
                )}
                <p className="hero-meta">
                  {liveMeta
                    ? `${liveMeta} · ${game.channel || ''}`
                    : timePHT
                      ? `${timePHT} · PHT · ${game.channel || ''}`
                      : game.channel || ''}
                </p>
              </div>
            </div>

            {isFinal && sortedPlayers.first.players.length > 0 && (
              <div className="box-section">
                <h2 className="section-title">Box score</h2>
                {[sortedPlayers.first, sortedPlayers.second].map((group, idx) => (
                  <div key={idx} className="team-section">
                    <div className="team-header-row">
                      <div
                        className="team-header-logo"
                        style={{ backgroundColor: group.team?.primary || colors.surfaceElevated }}
                      >
                        {group.team?.logo ? (
                          <img src={group.team.logo} alt="" className="team-header-logo-img" />
                        ) : (
                          <span className="team-header-logo-text">{group.team?.code}</span>
                        )}
                      </div>
                      <span className="team-header-name">{group.name}</span>
                      <div className="stat-header">
                        <span className="stat-header-text">PTS</span>
                        <span className="stat-header-text">REB</span>
                        <span className="stat-header-text">AST</span>
                      </div>
                    </div>
                    {group.players.map((p) => (
                      <div key={p.id} className="player-row">
                        <div className="player-left">
                          <div className="player-avatar">
                            {headshotUrl(p.personId) ? (
                              <img src={headshotUrl(p.personId)} alt="" className="player-avatar-img" />
                            ) : (
                              <span className="player-avatar-text">
                                {p.name.split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="player-name">{p.name}</span>
                        </div>
                        <div className="player-stats">
                          <span className="stat-cell">{p.points}</span>
                          <span className="stat-cell">{p.rebounds}</span>
                          <span className="stat-cell">{p.assists}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
