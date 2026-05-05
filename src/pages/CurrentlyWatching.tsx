import { motion } from "framer-motion";
import { PlayCircle, Loader2, Minus, Plus, X, Popcorn } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getSeriesDetail } from "@/lib/tmdb";
import { useSeriesContext } from "@/context/SeriesContext";

const CurrentlyWatching = () => {
  const { currentlyWatching, updateProgress, removeCurrentlyWatching, toggleWatched } = useSeriesContext();
  const ids = Object.keys(currentlyWatching);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["tmdb", "series", id],
      queryFn: () => getSeriesDetail(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const items = ids
    .map((id, i) => ({ id, series: queries[i].data, progress: currentlyWatching[id] }))
    .filter((x) => x.series);

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/50">
        <div className="container py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-border">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Currently Watching</h1>
                <p className="text-sm text-muted-foreground">{ids.length} series in progress</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        {loading && ids.length > 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(({ id, series, progress }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex gap-4 rounded-xl bg-card border border-border/50 p-4 card-hover"
              >
                <Link to={`/series/${id}`} className="shrink-0">
                  <img
                    src={series!.image}
                    alt={series!.title}
                    className="h-36 w-24 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <Link to={`/series/${id}`} className="block">
                      <h3 className="font-display font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {series!.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {series!.year} · {series!.seasons} seasons · {series!.status}
                    </p>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-3">
                      <ProgressStepper
                        label="Season"
                        value={progress.season}
                        onChange={(v) => updateProgress(id, v, progress.episode)}
                      />
                      <ProgressStepper
                        label="Episode"
                        value={progress.episode}
                        onChange={(v) => updateProgress(id, progress.season, v)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { toggleWatched(id); removeCurrentlyWatching(id); }}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Mark as Finished
                      </button>
                      <button
                        onClick={() => removeCurrentlyWatching(id)}
                        className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                      >
                        <X className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Popcorn className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Nothing in progress</p>
            <p className="text-sm text-muted-foreground">
              Hit the play icon on any series card to start tracking your progress.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Discover Series
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
};

const ProgressStepper = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    <div className="flex items-center rounded-lg border border-border/60 bg-background/40">
      <button onClick={() => onChange(Math.max(1, value - 1))} className="p-1.5 hover:text-primary" aria-label={`Decrease ${label}`}>
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-12 bg-transparent text-center text-sm font-semibold outline-none"
      />
      <button onClick={() => onChange(value + 1)} className="p-1.5 hover:text-primary" aria-label={`Increase ${label}`}>
        <Plus className="h-3 w-3" />
      </button>
    </div>
  </div>
);

export default CurrentlyWatching;
