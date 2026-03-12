import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScheduleProvider } from './context/ScheduleContext.jsx';
import { ActiveUsersProvider } from './context/ActiveUsersContext.jsx';
import { Layout } from './Layout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { SchedulePage } from './pages/SchedulePage.jsx';
import { StreamsPage } from './pages/StreamsPage.jsx';
import { StreamPage } from './pages/StreamPage.jsx';
import { GameDetailPage } from './pages/GameDetailPage.jsx';
import { TeamLastGameLeadersPage } from './pages/TeamLastGameLeadersPage.jsx';
import { PlayoffBracketPage } from './pages/PlayoffBracketPage.jsx';
import { NbaStreamsPage } from './pages/NbaStreamsPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { colors } from './theme.js';
import './App.css';

const WELCOME_KEY = 'nba-web-welcome-seen';

function WelcomeModal({ onDismiss }) {
  return (
    <div className="welcome-overlay" role="dialog" aria-label="Welcome">
      <div className="welcome-card">
        <h2 className="welcome-title">NBA Live Free</h2>
        <p className="welcome-body">
          This app helps you follow NBA games easily — today&apos;s games, upcoming schedule, live
          scores, game details in Philippine Time (PHT), and free NBA live streams.
        </p>
        <p className="welcome-credit">Created by Yuki</p>
        <button type="button" className="welcome-btn" onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) setShowWelcome(true);
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch (_) {}
  };

  return (
    <BrowserRouter>
      <ScheduleProvider>
        <ActiveUsersProvider>
          {showWelcome && <WelcomeModal onDismiss={dismissWelcome} />}
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="streams" element={<StreamsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="game/:id" element={<GameDetailPage />} />
              <Route path="stream" element={<StreamPage />} />
              <Route path="team-leaders/:id" element={<TeamLastGameLeadersPage />} />
              <Route path="playoff-bracket" element={<PlayoffBracketPage />} />
              <Route path="nba-streams" element={<NbaStreamsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ActiveUsersProvider>
      </ScheduleProvider>
    </BrowserRouter>
  );
}
