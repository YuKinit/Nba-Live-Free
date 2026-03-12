import React from 'react';
import { getTeamInfo } from '../data/teams.js';
import { formatTimePHT, formatDateLabelPHT } from '../utils/time.js';
import { colors } from '../theme.js';
import './ScheduleGameCard.css';

export function ScheduleGameCard({ game, onPress }) {
  const away = getTeamInfo(game.awayTeam);
  const home = getTeamInfo(game.homeTeam);
  const timePHT = formatTimePHT(game.startTimeUtc);
  const dateLabel = formatDateLabelPHT(game.startTimeUtc);

  return (
    <button type="button" className="schedule-card" onClick={() => onPress(game)}>
      <div className="schedule-card-row">
        <div className="schedule-card-date-col">
          <span className="schedule-card-date">{dateLabel}</span>
          <span className="schedule-card-time">{timePHT ? `${timePHT} PHT` : ''}</span>
        </div>
        <div className="schedule-card-matchup">
          <div className="schedule-card-team">
            <div
              className="schedule-card-logo"
              style={{ backgroundColor: away.primary || colors.surfaceElevated }}
            >
              {away.logo ? (
                <img src={away.logo} alt="" className="schedule-card-logo-img" />
              ) : (
                <span className="schedule-card-logo-code">{away.code}</span>
              )}
            </div>
            <span className="schedule-card-team-name">{game.awayTeam}</span>
          </div>
          <span className="schedule-card-vs">vs</span>
          <div className="schedule-card-team">
            <div
              className="schedule-card-logo"
              style={{ backgroundColor: home.primary || colors.surfaceElevated }}
            >
              {home.logo ? (
                <img src={home.logo} alt="" className="schedule-card-logo-img" />
              ) : (
                <span className="schedule-card-logo-code">{home.code}</span>
              )}
            </div>
            <span className="schedule-card-team-name">{game.homeTeam}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
