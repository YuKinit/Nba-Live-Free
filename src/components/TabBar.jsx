import React from 'react';
import { NavLink } from 'react-router-dom';
import './TabBar.css';

const TABS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/schedule', label: 'Schedule', icon: 'calendar' },
  { path: '/streams', label: 'Streams', icon: 'play-circle' },
  { path: '/about', label: 'About', icon: 'info' },
];

export function TabBar() {
  return (
    <nav className="tab-bar-wrapper">
      <div className="tab-bar-desktop-brand" aria-hidden>
        <div className="tab-bar-desktop-logo" />
        <div className="tab-bar-desktop-title">NBA Live Free</div>
      </div>
      <div className="tab-bar">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `tab-bar-item ${isActive ? 'tab-bar-item--active' : ''}`
            }
          >
            <span className="tab-bar-item-inner">
              <span className={`tab-bar-icon tab-bar-icon--${tab.icon}`} aria-hidden />
              <span className="tab-bar-label">{tab.label}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
