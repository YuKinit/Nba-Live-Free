import React from 'react';
import { colors } from '../theme.js';
import './AboutPage.css';

export function AboutPage() {
  return (
    <div className="page about-page">
      <div
        className="page-gradient"
        style={{
          background: `linear-gradient(180deg, ${colors.gradientStart}28, transparent)`,
        }}
      />
      <div className="page-safe">
        <header className="about-header">
          <h1 className="about-title">About</h1>
        </header>
        <div className="about-scroll">
          <div className="about-content">
            <h2 className="about-app-name">Nba Live Free</h2>
            <p className="about-paragraph">
              This app helps you follow NBA games easily — showing today&apos;s games, upcoming schedule,
              live scores, simple game details in Philippine Time (PHT), and letting you watch NBA live
              streams for free.
            </p>
            <p className="about-paragraph-muted">
              This app was created and is owned by Yuki as a personal fan project, and is not affiliated
              with, endorsed by, or sponsored by the NBA or its teams.
            </p>
            <a
              href="https://phcorner.org/members/yukinit.1375787/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              Visit my PHCorner profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
