import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme.js';
import './PlayoffBracketPage.css';

const ROUNDS = [
  { label: 'First Round', matchups: 4 },
  { label: 'Conference Semis', matchups: 2 },
  { label: 'Conference Finals', matchups: 1 },
  { label: 'Finals', matchups: 1 },
];

function BracketSection({ conference, roundData }) {
  return (
    <div className="bracket-section">
      <h3 className="round-label">{roundData.label}</h3>
      {Array.from({ length: roundData.matchups }).map((_, i) => (
        <div key={`${conference}-${roundData.label}-${i}`} className="bracket-matchup">
          <span className="bracket-vs-line">TBD</span>
          <span className="bracket-vs-sep">vs</span>
          <span className="bracket-vs-line">TBD</span>
        </div>
      ))}
    </div>
  );
}

export function PlayoffBracketPage() {
  const navigate = useNavigate();

  return (
    <div className="page playoff-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}20, transparent)`,
        }}
      />
      <div className="page-safe">
        <header className="playoff-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="playoff-title">Playoff Bracket</h1>
          <span className="playoff-spacer" />
        </header>
        <div className="playoff-scroll">
          <div className="playoff-content">
            <div className="conference-block">
              <h2 className="conference-title">Eastern Conference</h2>
              {ROUNDS.map((r) => (
                <BracketSection key={`east-${r.label}`} conference="East" roundData={r} />
              ))}
            </div>
            <div className="conference-block">
              <h2 className="conference-title">Western Conference</h2>
              {ROUNDS.map((r) => (
                <BracketSection key={`west-${r.label}`} conference="West" roundData={r} />
              ))}
            </div>
            <p className="playoff-disclaimer">
              Bracket matchups update as series are decided. Check back during the playoffs for results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
