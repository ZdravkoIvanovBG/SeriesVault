import { motion } from "framer-motion";
import { Layers, Loader2, RotateCcw, Popcorn } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useSeriesContext } from "@/context/SeriesContext";
import { getSeriesDetail, Series } from "@/lib/tmdb";
import { useTierList, TIERS, TierKey } from "@/hooks/useTierList";
import { Button } from "@/components/ui/button";

const TIER_COLORS: Record<TierKey, string> = {
  S: "from-rose-500 to-red-600",
  A: "from-orange-400 to-amber-500",
  B: "from-yellow-400 to-yellow-500",
  C: "from-lime-400 to-green-500",
  D: "from-sky-400 to-blue-500",
  F: "from-violet-500 to-purple-600",
};

interface DragData {
  id: string;
}

const TierList = () => {
  const { watchedIds } = useSeriesContext();
  const ids = useMemo(() => Array.from(watchedIds), [watchedIds]);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["tmdb", "series", id],
      queryFn: () => getSeriesDetail(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const seriesById = useMemo(() => {
    const m = new Map<string, Series>();
    queries.forEach((q) => q.data && m.set(q.data.id, q.data));
    return m;
  }, [queries]);

  const { tiers, assign, reset, tierOf } = useTierList();

  const unranked = useMemo(
    () => ids.filter((id) => !tierOf(id)).map((id) => seriesById.get(id)).filter(Boolean) as Series[],
    [ids, tierOf, seriesById],
  );

  const [dragId, setDragId] = useState<string | null>(null);
  const [overTier, setOverTier] = useState<TierKey | "POOL" | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragEnd = () => {
    setDragId(null);
    setOverTier(null);
  };

  const onDropTier = (tier: TierKey | null, beforeId?: string | null) => {
    const id = dragId;
    setDragId(null);
    setOverTier(null);
    if (!id) return;
    assign(id, tier, beforeId ?? null);
  };

  const Poster = ({ s }: { s: Series }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, s.id)}
      onDragEnd={onDragEnd}
      title={s.title}
      className={`group relative h-20 w-14 sm:h-24 sm:w-16 shrink-0 cursor-grab active:cursor-grabbing overflow-hidden rounded-md border border-border/60 bg-muted shadow-md transition-transform hover:scale-105 ${
        dragId === s.id ? "opacity-40" : ""
      }`}
    >
      <img
        src={s.image}
        alt={s.title}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1">
        <p className="truncate text-[9px] font-medium text-white">{s.title}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/50">
        <div className="container py-10 md:py-14 flex flex-wrap items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-border">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Tier List</h1>
              <p className="text-sm text-muted-foreground">
                Drag your watched shows into tiers
              </p>
            </div>
          </motion.div>

          <Button variant="outline" size="sm" onClick={reset} disabled={ids.length === 0}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </section>

      <section className="container py-8 space-y-6">
        {loading && ids.length > 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Popcorn className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No watched series yet</p>
            <p className="text-sm text-muted-foreground">
              Mark some shows as watched and they'll appear here, ready to rank.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Discover Series
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Tier rows */}
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
              {TIERS.map((t) => {
                const items = tiers[t]
                  .map((id) => seriesById.get(id))
                  .filter(Boolean) as Series[];
                const isOver = overTier === t;
                return (
                  <div key={t} className="flex border-b border-border/40 last:border-b-0 min-h-[6.5rem] sm:min-h-[7.5rem]">
                    <div
                      className={`flex w-16 sm:w-20 shrink-0 items-center justify-center bg-gradient-to-br ${TIER_COLORS[t]} text-3xl sm:text-4xl font-display font-black text-white drop-shadow`}
                    >
                      {t}
                    </div>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setOverTier(t);
                      }}
                      onDragLeave={() => setOverTier((cur) => (cur === t ? null : cur))}
                      onDrop={(e) => {
                        e.preventDefault();
                        onDropTier(t, null);
                      }}
                      className={`flex flex-1 flex-wrap items-center gap-2 p-3 transition-colors ${
                        isOver ? "bg-primary/10" : ""
                      }`}
                    >
                      {items.map((s) => (
                        <div
                          key={s.id}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOverTier(t);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDropTier(t, s.id);
                          }}
                        >
                          <Poster s={s} />
                        </div>
                      ))}
                      {items.length === 0 && (
                        <span className="text-xs text-muted-foreground/70 italic">
                          Drop shows here
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unranked pool */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setOverTier("POOL");
              }}
              onDragLeave={() => setOverTier((cur) => (cur === "POOL" ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                onDropTier(null);
              }}
              className={`rounded-xl border border-dashed p-4 transition-colors ${
                overTier === "POOL" ? "border-primary bg-primary/5" : "border-border/60 bg-card/30"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Unranked ({unranked.length})
                </h2>
                <span className="text-xs text-muted-foreground/70">Drag to a tier above</span>
              </div>
              {unranked.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground/70">
                  Every watched show has been ranked. Nice work.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unranked.map((s) => (
                    <Poster key={s.id} s={s} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default TierList;
