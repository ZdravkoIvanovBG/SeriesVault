import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Filter, Loader2, ArrowUpDown, TrendingUp, Star, Flame, Tv } from "lucide-react";
import { useBrowse, useSearchSeries, useGenres } from "@/hooks/useTMDB";
import SeriesCard from "@/components/SeriesCard";
import { Input } from "@/components/ui/input";
import { Series, BrowseCategory } from "@/lib/tmdb";

type SortOption = "default" | "rating_desc" | "rating_asc" | "name_asc" | "name_desc" | "year_desc" | "year_asc";

const CATEGORIES: { key: BrowseCategory; label: string; icon: React.ElementType }[] = [
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "popular", label: "Popular", icon: Flame },
  { key: "top_rated", label: "Top Rated", icon: Star },
  { key: "airing_today", label: "Airing Today", icon: Tv },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "rating_desc", label: "Rating: High → Low" },
  { value: "rating_asc", label: "Rating: Low → High" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
  { value: "year_desc", label: "Year: Newest" },
  { value: "year_asc", label: "Year: Oldest" },
];

function sortSeries(series: Series[], sort: SortOption): Series[] {
  if (sort === "default") return series;
  const sorted = [...series];
  switch (sort) {
    case "rating_desc": return sorted.sort((a, b) => b.rating - a.rating);
    case "rating_asc": return sorted.sort((a, b) => a.rating - b.rating);
    case "name_asc": return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name_desc": return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "year_desc": return sorted.sort((a, b) => (b.year || "0").localeCompare(a.year || "0"));
    case "year_asc": return sorted.sort((a, b) => (a.year || "0").localeCompare(b.year || "0"));
    default: return sorted;
  }
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [category, setCategory] = useState<BrowseCategory>("trending");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(1); }, [debouncedQuery, selectedGenre, category]);

  const isSearching = debouncedQuery.length >= 2;
  const { data: browseData, isLoading: browseLoading } = useBrowse(category, page);
  const { data: searchData, isLoading: searchLoading } = useSearchSeries(debouncedQuery, page);
  const { data: genres } = useGenres();

  const loading = isSearching ? searchLoading : browseLoading;
  const sourceData = isSearching ? searchData : browseData;

  const results = useMemo(() => {
    let items: Series[] = sourceData?.results || [];
    // Genre filter (client-side on browse results)
    if (selectedGenre && !isSearching) {
      const genreName = genres?.find((g) => g.id === selectedGenre)?.name;
      if (genreName) {
        items = items.filter((s) => s.genre.some((g) => g.toLowerCase().includes(genreName.toLowerCase())));
      }
    }
    return sortSeries(items, sortBy);
  }, [sourceData, selectedGenre, isSearching, genres, sortBy]);

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

      {/* Categories & Filters & Grid */}
      <section className="container py-8 md:py-12 space-y-6">
        {/* Category tabs */}
        {!isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground glow-border"
                      : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Genre filters */}
        {genres && genres.length > 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
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
              All Genres
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

        {/* Sort + count bar */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? `${results.length} results for "${debouncedQuery}"`
              : `${results.length} series`}
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg bg-secondary text-secondary-foreground border-none px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
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
              {isSearching ? "No series found matching your search." : "No series found."}
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Index;
