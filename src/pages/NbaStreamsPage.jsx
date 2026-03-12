import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme.js';
import './NbaStreamsPage.css';

const STREAMS_PAGE_URL = 'https://thetvapp.link/nbastreams';

export function NbaStreamsPage() {
  const navigate = useNavigate();

  return (
    <div className="page nba-streams-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}30, var(--background))`,
        }}
      />
      <div className="page-safe">
        <header className="nba-streams-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="nba-streams-title">NBA Live Streams</h1>
        </header>
        <div className="nba-streams-body">
          <p className="nba-streams-text">
            View the full list of NBA streams on the external site.
          </p>
          <a
            href={STREAMS_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nba-streams-link"
          >
            Open NBA Streams →
          </a>
        </div>
      </div>
    </div>
  );
}
