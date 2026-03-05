import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Eye, EyeOff, Bookmark, BookmarkCheck, Tv, Calendar, BarChart3, Loader2 } from "lucide-react";
import { useSeriesDetail } from "@/hooks/useTMDB";
import { useSeriesContext } from "@/context/SeriesContext";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: series, isLoading, error } = useSeriesDetail(id || "");
  const { isWatched, isOnWatchlist, toggleWatched, toggleWatchlist, getUserRating, setUserRating } =
    useSeriesContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!series || error) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Series not found.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const watched = isWatched(series.id);
  const onList = isOnWatchlist(series.id);
  const userRating = getUserRating(series.id) || 0;

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src={series.backdrop !== "/placeholder.svg" ? series.backdrop : series.image}
          alt={series.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-background/60 backdrop-blur-sm px-3 py-2 text-sm font-medium transition-colors hover:bg-background/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container relative -mt-32 z-10 pb-16">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden rounded-xl border border-border/50 shadow-lg">
              <img
                src={series.image}
                alt={series.title}
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={series.status === "Ongoing" ? "default" : "secondary"}
                  className={series.status === "Ongoing" ? "bg-primary/90 text-primary-foreground" : ""}
                >
                  {series.status}
                </Badge>
                {series.genre.map((g) => (
                  <Badge key={g} variant="outline" className="border-border/50">
                    {g}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                {series.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {series.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tv className="h-4 w-4" />
                  {series.seasons} Season{series.seasons > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {series.rating}/10
                </span>
                {series.networks && series.networks.length > 0 && (
                  <span className="text-xs">
                    on {series.networks.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toggleWatched(series.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  watched
                    ? "bg-primary text-primary-foreground glow-border"
                    : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
                }`}
              >
                {watched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {watched ? "Watched" : "Mark as Watched"}
              </button>
              <button
                onClick={() => toggleWatchlist(series.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  onList
                    ? "bg-primary text-primary-foreground glow-border"
                    : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
                }`}
              >
                {onList ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {onList ? "On Watchlist" : "Add to Watchlist"}
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">Overview</h2>
              <p className="leading-relaxed text-muted-foreground">{series.description}</p>
            </div>

            {/* Your Rating */}
            <div className="space-y-3 rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Your Rating</h2>
              </div>
              <StarRating rating={userRating} onRate={(r) => setUserRating(series.id, r)} />
              {userRating > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  You rated this{" "}
                  <span className="font-semibold text-primary">{userRating}/10</span>
                </motion.p>
              )}
            </div>

            {/* Season Breakdown */}
            {series.seasonDetails && series.seasonDetails.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg font-semibold">Seasons</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {series.seasonDetails.map((season) => (
                    <motion.div
                      key={season.season_number}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: season.season_number * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 card-hover"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-primary">
                        S{season.season_number}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{season.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {season.episode_count} episodes
                          {season.air_date ? ` · ${season.air_date.substring(0, 4)}` : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
