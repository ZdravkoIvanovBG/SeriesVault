import { motion, AnimatePresence } from "framer-motion";
import { Eye, Popcorn, Loader2, CalendarClock } from "lucide-react";
import { useSeriesContext } from "@/context/SeriesContext";
import SeriesCard from "@/components/SeriesCard";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getSeriesDetail } from "@/lib/tmdb";

const Watched = () => {
  const { watchedIds } = useSeriesContext();
  const ids = Array.from(watchedIds);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["tmdb", "series", id],
      queryFn: () => getSeriesDetail(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const watchedSeries = queries
    .filter((q) => q.data)
    .map((q) => q.data!);
  const ongoingSeries = watchedSeries.filter((s) => s.status === "Ongoing" || s.status === "Upcoming");

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/50">
        <div className="container py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-border">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Watched</h1>
                <p className="text-sm text-muted-foreground">
                  {ids.length} series completed
                </p>
              </div>
            </div>

            {watchedSeries.length > 0 && (
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total seasons: </span>
                  <span className="font-semibold text-primary">
                    {watchedSeries.reduce((acc, s) => acc + s.seasons, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg rating: </span>
                  <span className="font-semibold text-primary">
                    {(watchedSeries.reduce((acc, s) => acc + s.rating, 0) / watchedSeries.length).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="container py-8 md:py-12 space-y-10">
        {!loading && ongoingSeries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-5 md:p-6 space-y-4 glow-border"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <CalendarClock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Still going — new episodes ahead</h2>
                  <p className="text-xs text-muted-foreground">
                    {ongoingSeries.length} {ongoingSeries.length === 1 ? "series" : "series"} you've watched {ongoingSeries.length === 1 ? "is" : "are"} not fully ended yet.
                  </p>
                </div>
              </div>
              <Link
                to="/upcoming"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                See upcoming episodes
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {ongoingSeries.slice(0, 12).map((s) => (
                <Link
                  key={s.id}
                  to={`/series/${s.id}`}
                  className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {loading && ids.length > 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : watchedSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <AnimatePresence>
              {watchedSeries.map((series, i) => (
                <SeriesCard key={series.id} series={series} index={i} />
              ))}
            </AnimatePresence>
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
            <p className="text-lg font-medium">No series watched yet</p>
            <p className="text-sm text-muted-foreground">Start exploring and mark series as watched!</p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Discover Series
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Watched;
