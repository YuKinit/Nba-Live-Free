import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../theme.js';
import './StreamPage.css';

const LIST_FALLBACK = 'https://thetvapp.link/nbastreams';

export function StreamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, away, home, awayShort, homeShort, title } = location.state || {};
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [loading, setLoading] = useState(!!(away && home && !url));

  useEffect(() => {
    if (!away || !home || url) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ away, home });
    if (awayShort) params.set('awayShort', awayShort);
    if (homeShort) params.set('homeShort', homeShort);
    const q = params.toString();
    fetch(`/api/stream-proxy?${q}`)
      .then((res) => (res.ok ? res.json() : { url: null }))
      .then((data) => {
        if (!cancelled && data?.url && /\/nba\/[^/]+\/\d+$/.test(data.url)) {
          setResolvedUrl(data.url);
        } else {
          setResolvedUrl(LIST_FALLBACK);
        }
      })
      .catch(() => {
        if (!cancelled) setResolvedUrl(LIST_FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [away, home, awayShort, homeShort, url]);

  const iframeSrc =
    url && /\/nba\/[^/]+\/\d+$/.test(url)
      ? url
      : resolvedUrl;

  if (!iframeSrc && !(away && home)) {
    return (
      <div className="page stream-page">
        <header className="stream-page-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="stream-page-title">Stream</h1>
        </header>
        <div className="stream-page-message">
          <p>Go back and select a game to watch.</p>
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
        {iframeSrc && (
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="stream-page-external"
          >
            Open in new tab →
          </a>
        )}
      </header>
      {loading ? (
        <div className="page-center" style={{ flex: 1 }}>
          <div className="spinner" style={{ borderTopColor: colors.primary }} />
          <p className="stream-page-message">Finding stream…</p>
        </div>
      ) : iframeSrc ? (
        <iframe
          title={title || 'NBA stream'}
          src={iframeSrc}
          className="stream-iframe"
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
