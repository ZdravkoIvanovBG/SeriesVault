import { motion } from "framer-motion";
import { CalendarClock, Loader2, Tv, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { useSeriesContext } from "@/context/SeriesContext";
import { getUpcomingForSeries, NextEpisodeInfo } from "@/lib/upcoming";
import { posterUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";

const TZ = "Europe/Sofia";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseAirDate(d: string | null): Date | null {
  if (!d) return null;
  // TMDB returns YYYY-MM-DD (no time). Treat as midnight UTC.
  const dt = new Date(`${d}T00:00:00Z`);
  return isNaN(dt.getTime()) ? null : dt;
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, [target]);
  if (!target) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) return "Airing now / today";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const UpcomingCard = ({ info, index }: { info: NextEpisodeInfo; index: number }) => {
  const target = parseAirDate(info.nextEpisode?.air_date ?? null);
  const countdown = useCountdown(target);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group glass rounded-xl border border-border/50 overflow-hidden card-hover"
    >
      <div className="flex gap-4 p-4">
        <Link to={`/series/${info.seriesId}`} className="shrink-0">
          <img
            src={posterUrl(info.posterPath, "w185")}
            alt={info.seriesName}
            className="h-32 w-20 rounded-lg object-cover"
            loading="lazy"
          />
        </Link>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/series/${info.seriesId}`} className="font-display font-semibold leading-tight line-clamp-1 hover:text-primary">
              {info.seriesName}
            </Link>
            <Badge variant="secondary" className="text-[10px] shrink-0">{info.status}</Badge>
          </div>

          {info.nextEpisode ? (
            <>
              <div className="text-xs text-muted-foreground">
                S{String(info.nextEpisode.season_number).padStart(2, "0")}
                ·E{String(info.nextEpisode.episode_number).padStart(2, "0")}
                {info.nextEpisode.name && <> — <span className="text-foreground">{info.nextEpisode.name}</span></>}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {target ? dateFmt.format(target) : "TBA"}
                </span>
                {countdown && (
                  <span className="ml-auto text-xs font-semibold text-primary">{countdown}</span>
                )}
              </div>

              {info.networks.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Radio className="h-3 w-3" />
                  <span className="line-clamp-1">{info.networks.join(", ")}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground">
              No scheduled episode yet. {info.inProduction ? "In production — check back soon." : ""}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Upcoming = () => {
  const { watchedIds, watchlistIds, currentlyWatching } = useSeriesContext();
  const ids = useMemo(
    () => Array.from(new Set([...watchedIds, ...watchlistIds, ...Object.keys(currentlyWatching)])),
    [watchedIds, watchlistIds, currentlyWatching],
  );

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["upcoming", id],
      queryFn: () => getUpcomingForSeries(id),
      staleTime: 30 * 60 * 1000,
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const items = queries
    .map((q) => q.data)
    .filter((x): x is NextEpisodeInfo => !!x)
    .filter((x) => x.status !== "Ended" && x.status !== "Canceled");

  const withDate = items
    .filter((i) => i.nextEpisode?.air_date)
    .sort((a, b) => (a.nextEpisode!.air_date! < b.nextEpisode!.air_date! ? -1 : 1));
  const withoutDate = items.filter((i) => !i.nextEpisode?.air_date);

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/50">
        <div className="container py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-border">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Upcoming Episodes</h1>
                <p className="text-sm text-muted-foreground">
                  Air dates shown in your local time (Europe/Sofia)
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Pulled from your Watched + Watchlist. TMDB only publishes air dates (not exact air times),
              so times are not shown — episodes typically drop in the evening of the listed date in their
              originating region.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        {loading && ids.length > 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ids.length === 0 ? (
          <EmptyState
            text="Add ongoing shows to your Watched or Watchlist to see upcoming episodes here."
          />
        ) : items.length === 0 ? (
          <EmptyState text="None of your tracked shows are currently ongoing." />
        ) : (
          <div className="space-y-10">
            {withDate.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Scheduled</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {withDate.map((info, i) => (
                    <UpcomingCard key={info.seriesId} info={info} index={i} />
                  ))}
                </div>
              </div>
            )}
            {withoutDate.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-muted-foreground">
                  Awaiting schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {withoutDate.map((info, i) => (
                    <UpcomingCard key={info.seriesId} info={info} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
      <Tv className="h-8 w-8 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground max-w-md">{text}</p>
    <Link
      to="/"
      className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Discover Series
    </Link>
  </motion.div>
);

export default Upcoming;
