import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Eye, EyeOff, Bookmark, BookmarkCheck, Tv, Calendar, BarChart3 } from "lucide-react";
import { seriesDatabase } from "@/lib/series-data";
import { useSeriesContext } from "@/context/SeriesContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const StarRating = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hover || rating)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const series = seriesDatabase.find((s) => s.id === id);
  const { isWatched, isOnWatchlist, toggleWatched, toggleWatchlist, getUserRating, setUserRating } =
    useSeriesContext();

  if (!series) {
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

  // Generate mock season data
  const seasonData = Array.from({ length: series.seasons }, (_, i) => ({
    number: i + 1,
    episodes: Math.floor(Math.random() * 6) + 6, // 6-11 episodes
    year: parseInt(series.year) + i,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src={series.image}
          alt={series.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        {/* Back button */}
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
            {/* Title & badges */}
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
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Seasons</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {seasonData.map((season) => (
                  <motion.div
                    key={season.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: season.number * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 card-hover"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-primary">
                      S{season.number}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Season {season.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {season.episodes} episodes · {season.year}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
