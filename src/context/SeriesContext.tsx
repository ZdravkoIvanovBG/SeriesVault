import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Progress { season: number; episode: number; }

interface SeriesContextType {
  watchedIds: Set<string>;
  watchlistIds: Set<string>;
  userRatings: Record<string, number>;
  currentlyWatching: Record<string, Progress>;
  toggleWatched: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
  isOnWatchlist: (id: string) => boolean;
  setUserRating: (id: string, rating: number) => void;
  getUserRating: (id: string) => number | undefined;
  isCurrentlyWatching: (id: string) => boolean;
  startCurrentlyWatching: (id: string, season?: number, episode?: number) => Promise<void>;
  updateProgress: (id: string, season: number, episode: number) => Promise<void>;
  removeCurrentlyWatching: (id: string) => Promise<void>;
  ready: boolean;
}

const SeriesContext = createContext<SeriesContextType | undefined>(undefined);

export const useSeriesContext = () => {
  const ctx = useContext(SeriesContext);
  if (!ctx) throw new Error("useSeriesContext must be used within SeriesProvider");
  return ctx;
};

export const SeriesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [currentlyWatching, setCurrentlyWatching] = useState<Record<string, Progress>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setWatchedIds(new Set());
      setWatchlistIds(new Set());
      setUserRatings({});
      setCurrentlyWatching({});
      setReady(false);
      return;
    }
    setReady(false);
    (async () => {
      const [w, wl, r, cw] = await Promise.all([
        supabase.from("user_watched").select("series_id").eq("user_id", user.id),
        supabase.from("user_watchlist").select("series_id").eq("user_id", user.id),
        supabase.from("user_ratings").select("series_id, rating").eq("user_id", user.id),
        supabase.from("user_currently_watching").select("series_id, season, episode").eq("user_id", user.id),
      ]);
      setWatchedIds(new Set((w.data ?? []).map((x: any) => x.series_id)));
      setWatchlistIds(new Set((wl.data ?? []).map((x: any) => x.series_id)));
      const map: Record<string, number> = {};
      (r.data ?? []).forEach((x: any) => { map[x.series_id] = x.rating; });
      setUserRatings(map);
      const cwMap: Record<string, Progress> = {};
      (cw.data ?? []).forEach((x: any) => { cwMap[x.series_id] = { season: x.season, episode: x.episode }; });
      setCurrentlyWatching(cwMap);
      setReady(true);
    })();
  }, [user]);

  const toggleWatched = useCallback(async (id: string) => {
    if (!user) return;
    const has = watchedIds.has(id);
    setWatchedIds((prev) => {
      const next = new Set(prev);
      has ? next.delete(id) : next.add(id);
      return next;
    });
    if (has) {
      await supabase.from("user_watched").delete().eq("user_id", user.id).eq("series_id", id);
    } else {
      await supabase.from("user_watched").insert({ user_id: user.id, series_id: id });
    }
  }, [user, watchedIds]);

  const toggleWatchlist = useCallback(async (id: string) => {
    if (!user) return;
    const has = watchlistIds.has(id);
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      has ? next.delete(id) : next.add(id);
      return next;
    });
    if (has) {
      await supabase.from("user_watchlist").delete().eq("user_id", user.id).eq("series_id", id);
    } else {
      await supabase.from("user_watchlist").insert({ user_id: user.id, series_id: id });
    }
  }, [user, watchlistIds]);

  const setUserRating = useCallback(async (id: string, rating: number) => {
    if (!user) return;
    setUserRatings((prev) => ({ ...prev, [id]: rating }));
    await supabase.from("user_ratings").upsert({ user_id: user.id, series_id: id, rating });
  }, [user]);

  const startCurrentlyWatching = useCallback(async (id: string, season = 1, episode = 1) => {
    if (!user) return;
    setCurrentlyWatching((prev) => ({ ...prev, [id]: { season, episode } }));
    await supabase.from("user_currently_watching").upsert({ user_id: user.id, series_id: id, season, episode });
  }, [user]);

  const updateProgress = useCallback(async (id: string, season: number, episode: number) => {
    if (!user) return;
    const s = Math.max(1, season);
    const e = Math.max(1, episode);
    setCurrentlyWatching((prev) => ({ ...prev, [id]: { season: s, episode: e } }));
    await supabase.from("user_currently_watching").upsert({ user_id: user.id, series_id: id, season: s, episode: e });
  }, [user]);

  const removeCurrentlyWatching = useCallback(async (id: string) => {
    if (!user) return;
    setCurrentlyWatching((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await supabase.from("user_currently_watching").delete().eq("user_id", user.id).eq("series_id", id);
  }, [user]);

  return (
    <SeriesContext.Provider
      value={{
        watchedIds,
        watchlistIds,
        userRatings,
        currentlyWatching,
        toggleWatched,
        toggleWatchlist,
        isWatched: (id) => watchedIds.has(id),
        isOnWatchlist: (id) => watchlistIds.has(id),
        setUserRating,
        getUserRating: (id) => userRatings[id],
        isCurrentlyWatching: (id) => id in currentlyWatching,
        startCurrentlyWatching,
        updateProgress,
        removeCurrentlyWatching,
        ready,
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};
