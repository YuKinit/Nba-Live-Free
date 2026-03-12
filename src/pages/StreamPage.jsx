import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './StreamPage.css';

export function StreamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, title } = location.state || {};

  if (!url) {
    return (
      <div className="page stream-page">
        <header className="stream-page-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="stream-page-title">Stream</h1>
        </header>
        <div className="stream-page-message">
          <p>No stream URL provided. Go back and select a game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page stream-page stream-page--full">
      <header className="stream-page-header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="stream-page-title" title={title}>
          {title || 'NBA Stream'}
        </h1>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="stream-page-external"
        >
          Open in new tab →
        </a>
      </header>
      <iframe
        title={title || 'NBA stream'}
        src={url}
        className="stream-iframe"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </div>
  );
}
