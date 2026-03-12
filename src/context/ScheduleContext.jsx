import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchNbaSchedule, fetchBoxscore } from '../services/nbaApi.js';
import { isTodayPHT } from '../utils/time.js';

const LIVE_POLL_INTERVAL_MS = 15000;
const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveData, setLiveData] = useState({});
  const pollRef = useRef(null);

  const hasPlayoffGames = useMemo(
    () => games.some((g) => g.gameLabel && /playoff/i.test(g.gameLabel)),
    [games]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNbaSchedule();
      setGames(list);
    } catch (e) {
      setError(e?.message || 'Failed to load schedule');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const liveIds = games
      .filter((g) => g.status === 'LIVE' && isTodayPHT(g.startTimeUtc))
      .map((g) => g.id);
    if (liveIds.length === 0) {
      setLiveData({});
      return;
    }
    const fetchAll = async () => {
      const next = {};
      await Promise.all(
        liveIds.map(async (id) => {
          const box = await fetchBoxscore(id);
          if (box) next[id] = box;
        })
      );
      setLiveData((prev) => (Object.keys(next).length ? { ...prev, ...next } : prev));
    };
    fetchAll();
    pollRef.current = setInterval(fetchAll, LIVE_POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [games]);

  return (
    <ScheduleContext.Provider value={{ games, loading, error, refetch: load, liveData, hasPlayoffGames }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used inside ScheduleProvider');
  return ctx;
}
