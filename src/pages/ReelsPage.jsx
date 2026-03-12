import React from 'react';
import { colors } from '../theme.js';
import './ReelsPage.css';

const YOUTUBE_SHORTS_URL = 'https://www.youtube.com/shorts/';

export function ReelsPage() {
  return (
    <div className="page reels-page">
      <div className="reels-embed-wrap">
        <p className="reels-hint">
          NBA highlights and shorts — open YouTube Shorts in a new tab for the best experience.
        </p>
        <a
          href={YOUTUBE_SHORTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="reels-link"
        >
          Open YouTube Shorts →
        </a>
        <iframe
          title="YouTube Shorts"
          src={YOUTUBE_SHORTS_URL}
          className="reels-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
