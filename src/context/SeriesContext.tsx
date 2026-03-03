import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Series } from "@/lib/series-data";

interface SeriesContextType {
  watchedIds: Set<string>;
  watchlistIds: Set<string>;
  toggleWatched: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
  isOnWatchlist: (id: string) => boolean;
}

const SeriesContext = createContext<SeriesContextType | undefined>(undefined);

export const useSeriesContext = () => {
  const ctx = useContext(SeriesContext);
  if (!ctx) throw new Error("useSeriesContext must be used within SeriesProvider");
  return ctx;
};

export const SeriesProvider = ({ children }: { children: ReactNode }) => {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("watched");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify([...watchedIds]));
  }, [watchedIds]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify([...watchlistIds]));
  }, [watchlistIds]);

  const toggleWatched = (id: string) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SeriesContext.Provider
      value={{
        watchedIds,
        watchlistIds,
        toggleWatched,
        toggleWatchlist,
        isWatched: (id) => watchedIds.has(id),
        isOnWatchlist: (id) => watchlistIds.has(id),
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};
