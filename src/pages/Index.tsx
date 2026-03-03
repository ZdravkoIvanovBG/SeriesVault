import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Filter } from "lucide-react";
import { seriesDatabase } from "@/lib/series-data";
import SeriesCard from "@/components/SeriesCard";
import { Input } from "@/components/ui/input";

const allGenres = [...new Set(seriesDatabase.flatMap((s) => s.genre))].sort();

const Index = () => {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return seriesDatabase.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = !selectedGenre || s.genre.includes(selectedGenre);
      return matchesQuery && matchesGenre;
    });
  }, [query, selectedGenre]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

        <div className="container relative py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Track your series journey</span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your Personal
              <br />
              <span className="text-gradient">Series Vault</span>
            </h1>

            <p className="text-muted-foreground text-lg">
              Search, track, and organize every TV series you've ever watched.
            </p>

            {/* Search */}
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search series..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-11 bg-card border-border/50 rounded-xl text-sm focus-visible:ring-primary/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container py-8 md:py-12 space-y-6">
        {/* Genre filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedGenre(null)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedGenre
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
            }`}
          >
            All
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGenre === genre
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
              }`}
            >
              {genre}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} series found
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filtered.map((series, i) => (
            <SeriesCard key={series.id} series={series} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-muted-foreground">No series found matching your search.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Index;
