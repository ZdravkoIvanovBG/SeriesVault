import { motion } from "framer-motion";
import { Eye, EyeOff, Bookmark, BookmarkCheck, Star, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { Series } from "@/lib/series-data";
import { useSeriesContext } from "@/context/SeriesContext";
import { Badge } from "@/components/ui/badge";

interface SeriesCardProps {
  series: Series;
  index?: number;
}

const SeriesCard = ({ series, index = 0 }: SeriesCardProps) => {
  const { isWatched, isOnWatchlist, toggleWatched, toggleWatchlist } = useSeriesContext();
  const watched = isWatched(series.id);
  const onList = isOnWatchlist(series.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border/50 card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={series.image}
          alt={series.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={series.status === "Ongoing" ? "default" : "secondary"}
            className={`text-xs ${series.status === "Ongoing" ? "bg-primary/90 text-primary-foreground" : ""}`}
          >
            {series.status}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-background/80 backdrop-blur-sm px-2 py-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-semibold">{series.rating}</span>
        </div>

        {/* Watched overlay */}
        {watched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-1">
              <Eye className="h-8 w-8 text-primary" />
              <span className="text-xs font-semibold text-primary">Watched</span>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => toggleWatched(series.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur-sm transition-colors ${
              watched
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            title={watched ? "Mark as unwatched" : "Mark as watched"}
          >
            {watched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => toggleWatchlist(series.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur-sm transition-colors ${
              onList
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            title={onList ? "Remove from watchlist" : "Add to watchlist"}
          >
            {onList ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Info */}
      <Link to={`/series/${series.id}`} className="block p-4 space-y-2">
        <h3 className="font-display font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {series.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{series.year}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <Tv className="h-3 w-3" />
          <span>{series.seasons}S</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {series.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              {g}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
};

export default SeriesCard;
