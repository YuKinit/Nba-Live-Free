import React from 'react';
import { getTeamInfo } from '../data/teams.js';
import { formatTimePHT } from '../utils/time.js';
import { colors, spacing } from '../theme.js';
import './GameCard.css';

export function GameCard({ game, dateLabel, liveData: liveDataForGame, onPress }) {
  const isLive = game.status === 'LIVE';
  const isFinal = game.status === 'FINAL';
  const hasScore = isLive || isFinal;
  const away = getTeamInfo(game.awayTeam);
  const home = getTeamInfo(game.homeTeam);
  const timePHT = formatTimePHT(game.startTimeUtc);
  const displayDate = dateLabel != null ? dateLabel : 'Today';

  const live = isLive && liveDataForGame ? liveDataForGame : null;
  const awayScore = live ? live.awayScore : game.awayScore;
  const homeScore = live ? live.homeScore : game.homeScore;
  const periodLabel = live && live.period != null ? `Q${live.period}` : null;
  const clockLabel = live && live.gameClock != null ? live.gameClock : null;

  return (
    <button type="button" className="game-card-wrapper" onClick={() => onPress(game)}>
      <div className={`game-card ${isLive ? 'game-card--live' : ''}`}>
        <div
          className="game-card-accent"
          style={{
            background: isLive
              ? `linear-gradient(90deg, ${colors.live}, #FF6B6B)`
              : `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
          }}
        />
        <div className="game-card-inner">
          <div className="game-card-header">
            <span className="game-card-date">{displayDate}</span>
            {isLive && (
              <span className="game-card-live-badge">
                <span className="game-card-live-pulse" />
                LIVE
              </span>
            )}
            {isFinal && <span className="game-card-final-badge">FINAL</span>}
          </div>
          <div className="game-card-matchup">
            <div className="game-card-team-row">
              <div
                className="game-card-logo-wrapper"
                style={{ backgroundColor: away.primary || colors.surfaceElevated }}
              >
                {away.logo ? (
                  <img src={away.logo} alt="" className="game-card-logo-img" />
                ) : (
                  <span className="game-card-logo-text">{away.code}</span>
                )}
              </div>
              <span className="game-card-team-name">{game.awayTeam}</span>
              {hasScore && <span className="game-card-score">{awayScore ?? '–'}</span>}
            </div>
            <div className="game-card-vs-line" />
            <div className="game-card-team-row">
              <div
                className="game-card-logo-wrapper"
                style={{ backgroundColor: home.primary || colors.surfaceElevated }}
              >
                {home.logo ? (
                  <img src={home.logo} alt="" className="game-card-logo-img" />
                ) : (
                  <span className="game-card-logo-text">{home.code}</span>
                )}
              </div>
              <span className="game-card-team-name">{game.homeTeam}</span>
              {hasScore && <span className="game-card-score">{homeScore ?? '–'}</span>}
            </div>
          </div>
          <div className="game-card-footer">
            <span className="game-card-time">
              {isLive && periodLabel != null && clockLabel != null
                ? `${periodLabel} ${clockLabel}`
                : timePHT
                  ? `${timePHT} · PHT`
                  : ''}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
