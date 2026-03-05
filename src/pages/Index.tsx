import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Filter, Loader2 } from "lucide-react";
import { useTrending, useSearchSeries, useGenres } from "@/hooks/useTMDB";
import SeriesCard from "@/components/SeriesCard";
import { Input } from "@/components/ui/input";
import { Series } from "@/lib/tmdb";

const Index = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedQuery, selectedGenre]);

  const isSearching = debouncedQuery.length >= 2;
  const { data: trendingData, isLoading: trendingLoading } = useTrending(page);
  const { data: searchData, isLoading: searchLoading } = useSearchSeries(debouncedQuery, page);
  const { data: genres } = useGenres();

  const loading = isSearching ? searchLoading : trendingLoading;
  const sourceData = isSearching ? searchData : trendingData;

  // Filter by genre client-side
  let results: Series[] = sourceData?.results || [];
  if (selectedGenre && !isSearching) {
    // For trending, we can filter by genre from the genre_ids (already mapped)
    // But since we mapped to strings, we need the genre name
    const genreName = genres?.find((g) => g.id === selectedGenre)?.name;
    if (genreName) {
      results = results.filter((s) => s.genre.some((g) => g.toLowerCase().includes(genreName.toLowerCase())));
    }
  }

  const totalPages = sourceData?.totalPages || 1;

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
              <span className="text-xs font-medium text-primary">100,000+ TV series from TMDB</span>
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
                placeholder="Search any TV series..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-11 bg-card border-border/50 rounded-xl text-sm focus-visible:ring-primary/50"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container py-8 md:py-12 space-y-6">
        {/* Genre filters */}
        {genres && genres.length > 0 && !isSearching && (
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
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Section title */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? `${results.length} results for "${debouncedQuery}"`
              : `Trending this week`}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {results.map((series, i) => (
                <SeriesCard key={series.id} series={series} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.min(totalPages, 500)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= Math.min(totalPages, 500)}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-muted-foreground">
              {isSearching ? "No series found matching your search." : "Failed to load trending series."}
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Index;
