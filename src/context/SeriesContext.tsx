import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface SeriesContextType {
  watchedIds: Set<string>;
  watchlistIds: Set<string>;
  userRatings: Record<string, number>;
  toggleWatched: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
  isOnWatchlist: (id: string) => boolean;
  setUserRating: (id: string, rating: number) => void;
  getUserRating: (id: string) => number | undefined;
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
  const [ready, setReady] = useState(false);

  // Load from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setWatchedIds(new Set());
      setWatchlistIds(new Set());
      setUserRatings({});
      setReady(false);
      return;
    }
    setReady(false);
    (async () => {
      const [w, wl, r] = await Promise.all([
        supabase.from("user_watched").select("series_id").eq("user_id", user.id),
        supabase.from("user_watchlist").select("series_id").eq("user_id", user.id),
        supabase.from("user_ratings").select("series_id, rating").eq("user_id", user.id),
      ]);
      setWatchedIds(new Set((w.data ?? []).map((x: any) => x.series_id)));
      setWatchlistIds(new Set((wl.data ?? []).map((x: any) => x.series_id)));
      const map: Record<string, number> = {};
      (r.data ?? []).forEach((x: any) => { map[x.series_id] = x.rating; });
      setUserRatings(map);
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

  return (
    <SeriesContext.Provider
      value={{
        watchedIds,
        watchlistIds,
        userRatings,
        toggleWatched,
        toggleWatchlist,
        isWatched: (id) => watchedIds.has(id),
        isOnWatchlist: (id) => watchlistIds.has(id),
        setUserRating,
        getUserRating: (id) => userRatings[id],
        ready,
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};
