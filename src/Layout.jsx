import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from './components/TabBar.jsx';
import './pages/pages.css';

const HIDE_TABS_PREFIXES = ['/game/', '/team-leaders/', '/playoff-bracket', '/nba-streams'];

export function Layout() {
  const location = useLocation();
  const pathname = location.pathname || '';
  // Important: don't hide on `/streams` (tab). Only hide on single stream pages like `/stream/...`.
  const hideTabs =
    HIDE_TABS_PREFIXES.some((p) => pathname.startsWith(p) || pathname === p) ||
    pathname === '/stream' ||
    pathname.startsWith('/stream/');

  return (
    <div className="app-layout">
      <main className="app-main">
        <Outlet />
      </main>
      {!hideTabs && (
        <footer className="app-footer">
          <TabBar />
        </footer>
      )}
    </div>
  );
}
