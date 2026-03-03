import { motion, AnimatePresence } from "framer-motion";
import { Eye, Popcorn } from "lucide-react";
import { seriesDatabase } from "@/lib/series-data";
import { useSeriesContext } from "@/context/SeriesContext";
import SeriesCard from "@/components/SeriesCard";
import { Link } from "react-router-dom";

const Watched = () => {
  const { watchedIds } = useSeriesContext();
  const watchedSeries = seriesDatabase.filter((s) => watchedIds.has(s.id));

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
                  {watchedSeries.length} series completed
                </p>
              </div>
            </div>

            {/* Stats */}
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

      <section className="container py-8 md:py-12">
        {watchedSeries.length > 0 ? (
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
