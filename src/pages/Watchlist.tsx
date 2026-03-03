import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ListPlus } from "lucide-react";
import { seriesDatabase } from "@/lib/series-data";
import { useSeriesContext } from "@/context/SeriesContext";
import SeriesCard from "@/components/SeriesCard";
import { Link } from "react-router-dom";

const Watchlist = () => {
  const { watchlistIds } = useSeriesContext();
  const series = seriesDatabase.filter((s) => watchlistIds.has(s.id));

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/50">
        <div className="container py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-border">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Watchlist</h1>
                <p className="text-sm text-muted-foreground">
                  {series.length} series to watch
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        {series.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <AnimatePresence>
              {series.map((s, i) => (
                <SeriesCard key={s.id} series={s} index={i} />
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
              <ListPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground">Browse and bookmark series to watch later!</p>
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

export default Watchlist;
