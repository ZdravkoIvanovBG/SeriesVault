import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("ratings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify([...watchedIds]));
  }, [watchedIds]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify([...watchlistIds]));
  }, [watchlistIds]);

  useEffect(() => {
    localStorage.setItem("ratings", JSON.stringify(userRatings));
  }, [userRatings]);

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

  const setUserRating = (id: string, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [id]: rating }));
  };

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
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};
