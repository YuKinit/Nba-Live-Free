import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const PRESENCE_CHANNEL = 'app:active-users';

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const ActiveUsersContext = createContext({ activeCount: null, isConnected: false });

export function ActiveUsersProvider({ children }) {
  const [activeCount, setActiveCount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef(null);
  const presenceIdRef = useRef(randomId());

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase.channel(PRESENCE_CHANNEL);
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let count = 0;
        Object.values(state).forEach((arr) => {
          count += Array.isArray(arr) ? arr.length : 0;
        });
        setActiveCount(count);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        let count = 0;
        Object.values(state).forEach((arr) => {
          count += Array.isArray(arr) ? arr.length : 0;
        });
        setActiveCount(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        let count = 0;
        Object.values(state).forEach((arr) => {
          count += Array.isArray(arr) ? arr.length : 0;
        });
        setActiveCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({ id: presenceIdRef.current, at: Date.now() });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        channel.track({ id: presenceIdRef.current, at: Date.now() }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsConnected(false);
      setActiveCount(null);
    };
  }, []);

  return (
    <ActiveUsersContext.Provider value={{ activeCount, isConnected }}>
      {children}
    </ActiveUsersContext.Provider>
  );
}

export function useActiveUsers() {
  const ctx = useContext(ActiveUsersContext);
  return ctx ?? { activeCount: null, isConnected: false };
}
